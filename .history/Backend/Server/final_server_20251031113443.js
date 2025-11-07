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
app.post('/receive_data', async (req, res) => {
    const rawText = req.body;
    console.log("Received raw text data...");

    if (!rawText || rawText.length < 20) {
        return res.status(400).json({ error: "Insufficient text data received." });
    }

    const todaysTimestamp = new Date().toISOString();
    const systemPrompt = `
        You are an expert data analysis engine. Your task is to analyze raw text and extract specific information.
        The output MUST be a valid JSON object and nothing else.
        The JSON object must have these keys: "title", "summary", "keywords" (an array), "emotions" (an array),
        "timestamp" (use ${todaysTimestamp} if none is found), and "source_url" (return null if not found).
    `;

    try {
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

        console.log("Saving to Supabase...");
        const { error: dbError } = await supabase
            .from('content_documents')
            .insert([{ metadata: structuredData }]);
        
        if (dbError) throw dbError;
        
        console.log("Successfully saved data to Supabase.");
        res.status(200).json(structuredData);

    } catch (error) {
        console.error("Error in /receive_data route:", error);
        res.status(500).json({ error: "Failed to process data." });
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
app.post('/mobile_share', async (req, res) => {
    console.log("Received mobile share request...");
    
    try {
        const { url, title, text, source_app, device_info } = req.body;
        
        // Validation
        if (!url && !text) {
            return res.status(400).json({ 
                error: "Either URL or text content is required." 
            });
        }

        // Build the raw text for AI processing (same format as extension)
        let rawTextToSend = "";
        
        if (url) {
            rawTextToSend += `Source URL: ${url}\n\n`;
        }
        
        if (title) {
            rawTextToSend += `Title: ${title}\n\n`;
        }
        
        if (text) {
            rawTextToSend += text;
        }
        
        // Add metadata for tracking
        const metadata = {
            source_app: source_app || 'unknown',
            device_type: device_info?.platform || 'mobile',
            shared_at: new Date().toISOString()
        };

        console.log("Processing mobile share with Groq...");
        
        // Use the SAME AI processing as the extension
        const todaysTimestamp = new Date().toISOString();
        const systemPrompt = `
            You are an expert data analysis engine. Your task is to analyze raw text and extract specific information.
            The output MUST be a valid JSON object and nothing else.
            The JSON object must have these keys: "title", "summary", "keywords" (an array), "emotions" (an array),
            "timestamp" (use ${todaysTimestamp} if none is found), and "source_url" (return null if not found).
        `;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this text:\n---\n${rawTextToSend}\n---` }
            ]
        });

        const jsonResponseText = completion.choices[0].message.content || '{}';
        const structuredData = JSON.parse(jsonResponseText);
        
        // Merge in our mobile-specific metadata
        structuredData.mobile_metadata = metadata;
        
        console.log("Successfully parsed structured data from Groq.");

        // Save to Supabase (same table as extension data)
        console.log("Saving to Supabase...");
        const { data: dbData, error: dbError } = await supabase
            .from('content_documents')
            .insert([{ metadata: structuredData }])
            .select();

        if (dbError) {
            console.error("Supabase insert error:", dbError);
            throw dbError;
        }

        console.log("Successfully saved mobile share to Supabase:", dbData[0]?.id);
        
        // Return success with the created document ID
        res.status(200).json({
            success: true,
            message: "Content saved successfully",
            document_id: dbData[0]?.id,
            processed_data: structuredData
        });

    } catch (error) {
        console.error("Error processing mobile share:", error);
        res.status(500).json({ 
            error: "Failed to process mobile share.",
            details: error.message 
        });
    }
});

// === OPTIONAL: Endpoint to verify mobile app authentication ===
app.post('/mobile_auth', async (req, res) => {
    const { device_id, app_version } = req.body;
    
    // Simple device registration (enhance with proper auth later)
    try {
        const { data, error } = await supabase
            .from('mobile_devices')
            .upsert([
                { 
                    device_id, 
                    app_version,
                    last_active: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: "Device registered",
            device_data: data[0]
        });
    } catch (error) {
        console.error("Mobile auth error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});
// --- Start the Server ---
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});