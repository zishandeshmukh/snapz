import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

// --- Basic Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// --- Initialize Clients ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- Initialize Express App ---
const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
// Middleware specifically for the /receive_data route to handle raw text
app.use('/receive_data', express.text({ type: '*/*', limit: '10mb' }));
// General JSON middleware for other routes if needed
app.use(express.json());

// Multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// route handling for the NLP Query, it analyzes the query and gives the sql query to interacts with the database
app.post('/searchNLPSql', async (req,res)=>{
    const data=req.body;
    
})

// === ROUTE 1: /receive_data (for text content) ===
// Reusable processing function: analyze text via OpenAI and save to Supabase
async function analyzeAndSave(rawText, sourceUrl = null) {
    if (!rawText || rawText.length < 20) {
        throw new Error('Insufficient text data received.');
    }

    const todaysTimestamp = new Date().toISOString();
    const systemPrompt = `
        You are an expert data analysis engine. Your task is to analyze raw text and extract specific information.
        The output MUST be a valid JSON object and nothing else.
        The JSON object must have these keys: "title", "summary", "keywords" (an array), "emotions" (an array),
        "timestamp" (use ${todaysTimestamp} if none is found), and "source_url" (return null if not found).
    `;

    console.log("Sending data to OpenAI for analysis...");
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze this text:\n---\n${rawText}\n---` }
        ]
    });

    const jsonResponseText = completion.choices[0].message.content || '{}';
    const structuredData = JSON.parse(jsonResponseText);
    console.log("Successfully parsed structured data from OpenAI.");

    // If caller provided a source URL, prefer it when source_url is missing/null
    if (sourceUrl && (!structuredData.source_url || structuredData.source_url === null)) {
        structuredData.source_url = sourceUrl;
    }

    console.log("Saving to Supabase...");
    const { error: dbError } = await supabase
        .from('content_documents')
        .insert([{ metadata: structuredData }]);

    if (dbError) throw dbError;

    console.log("Successfully saved data to Supabase.");
    return structuredData;
}

// Existing /receive_data now delegates to analyzeAndSave
app.post('/receive_data', async (req, res) => {
    try {
        const rawText = req.body;
        console.log("/receive_data invoked");
        const result = await analyzeAndSave(rawText);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in /receive_data route:", error);
        res.status(500).json({ error: error.message || "Failed to process data." });
    }
});

// === ROUTE: /mobile/share ===
// This endpoint accepts mobile share payloads and reuses the same AI processing pipeline.
// Expected JSON body: { url: string, title?: string, description?: string, metadata?: object }
app.post('/mobile/share', async (req, res) => {
    // If MOBILE_API_KEY is set in env, require it in the x-api-key header
    const mobileApiKey = process.env.MOBILE_API_KEY;
    if (mobileApiKey) {
        const provided = req.headers['x-api-key'] || req.headers['X-API-KEY'];
        if (!provided || provided !== mobileApiKey) {
            console.warn('Unauthorized mobile share attempt');
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }
    try {
        const { url, title, description, metadata } = req.body || {};

        if (!url && !title && !description) {
            return res.status(400).json({ error: 'At least one of url, title or description must be provided.' });
        }

        // Build a combined text payload for the analyzer that mirrors web extension behavior.
        let combined = '';
        if (title) combined += `${title}\n\n`;
        if (description) combined += `${description}\n\n`;
        if (url) combined += `Source URL: ${url}\n\n`;
        if (metadata && typeof metadata === 'object') {
            try {
                combined += `Metadata: ${JSON.stringify(metadata)}\n`;
            } catch (e) {
                // ignore metadata serialization errors
            }
        }

        const structured = await analyzeAndSave(combined, url || null);
        return res.status(200).json(structured);
    } catch (error) {
        console.error('Error in /mobile/share:', error);
        return res.status(500).json({ error: error.message || 'Failed to process mobile share.' });
    }
});
// === ROUTE 2: /searchByImage (UPDATED with keyword cleaning) ===
app.post('/searchByImage', upload.single('image'), async (req, res) => {
    console.log("Received image for analysis...");
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }
    try {
        const base64Image = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        console.log("Sending image to OpenAI for keyword extraction...");
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this image and provide 3-5 keywords that describe it. Return only a single, space-separated string of keywords with no commas. For example: "cat sitting window sill".' },
                        { type: 'image_url', image_url: { url: dataUrl } },
                    ],
                },
            ],
        });

        const rawKeywords = response.choices[0].message.content;
        if (!rawKeywords) throw new Error("AI did not return any keywords.");

        // --- THIS IS THE FIX ---
        // Clean the keywords: remove all commas, then split by space, and filter out any empty strings.
        const cleanedKeywords = rawKeywords.replace(/,/g, '').toLowerCase().split(' ').filter(Boolean);
        
        console.log(`OpenAI identified keywords: "${cleanedKeywords.join(' ')}"`);

        // Build the search query using the cleaned keywords.
        const searchQuery = cleanedKeywords.join(' | ');

        console.log(`Searching database with query: "${searchQuery}"`);
        const { data, error } = await supabase
            .from('content_documents')
            .select('id')
            .textSearch('fts', searchQuery, {
                type: 'websearch',
                config: 'simple'
            });
        
        if (error) throw error;

        const matchingIds = data.map(item => String(item.id));
        console.log(`Found ${matchingIds.length} matching documents.`);
        
        res.status(200).json({
            keywords: cleanedKeywords, // Send the clean keywords back to the frontend
            ids: matchingIds
        });
    } catch (error) {
        console.error("Error during image search:", error);
        res.status(500).json({ error: 'Failed to perform image search.' });
    }
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});