import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiTextModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const geminiVisionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); // or gemini-1.5-flash

// Supabase Admin client (use service key for admin tasks, but sparingly)
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// --- Initialize Express App ---
const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' })); // General JSON middleware
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// === NEW: Authentication Middleware ===
// This middleware authenticates the user for *every* request
// and attaches their user-specific Supabase client and user ID.
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Create a user-specific Supabase client using the user's token
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Get the user's identity from the token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Attach the user-specific client and user data to the request
    req.supabase = supabase;
    req.user = user;
    
    next();
};

// Apply the authentication middleware to all routes that need it
app.use('/receive_data', authenticateUser);
app.use('/searchByImage', authenticateUser);
app.use('/searchNLPSql', authenticateUser);

// === ROUTE 1: /receive_data (Using Gemini) ===
app.post('/receive_data', async (req, res) => {
    // Expecting { rawText: "...", source: "W" }
    const { rawText, source } = req.body;
    
    console.log(`Received raw text data from source: ${source}`);

    if (!rawText || rawText.length < 20) {
        return res.status(400).json({ error: "Insufficient text data received." });
    }
    if (!source || !['W', 'M'].includes(source)) {
        return res.status(400).json({ error: "Invalid or missing 'source' (must be 'W' or 'M')." });
    }

    const todaysTimestamp = new Date().toISOString();
    const systemPrompt = `
        You are an expert data analysis engine. Your task is to analyze raw text and extract specific information.
        The output MUST be a valid JSON object and nothing else.
        The JSON object must have these keys: "title", "summary", "keywords" (an array), "emotions" (an array),
        "timestamp" (use ${todaysTimestamp} if none is found), and "source_url" (return null if not found).
    `;

    try {
        console.log("Sending data to Gemini for analysis...");
        const result = await geminiTextModel.generateContent([
            systemPrompt,
            `Analyze this text:\n---\n${rawText}\n---`
        ]);
        
        const response = result.response;
        // Clean up Gemini's response to get raw JSON
        const jsonResponseText = response.text()
            .replace(/```json\n/g, '')
            .replace(/\n```/g, '')
            .trim();

        const structuredData = JSON.parse(jsonResponseText);
        console.log("Successfully parsed structured data from Gemini.");

        console.log("Saving to Supabase...");
        
        // We use req.supabase (the user's client)
        // RLS in the database will ensure req.user.id is added correctly
        const { data, error: dbError } = await req.supabase
            .from('content_documents')
            .insert([{ 
                metadata: structuredData, 
                user_id: req.user.id, // Explicitly pass the user ID
                source: source         // Pass the source
            }])
            .select();
        
        if (dbError) throw dbError;
        
        console.log("Successfully saved data to Supabase:", data);
        res.status(200).json(structuredData);

    } catch (error) {
        console.error("Error in /receive_data route:", error);
        res.status(500).json({ error: "Failed to process data." });
    }
});

// === ROUTE 2: /searchByImage (Using Gemini Vision) ===
app.post('/searchByImage', upload.single('image'), async (req, res) => {
    console.log("Received image for analysis...");
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Convert buffer to base64
        const base64Image = imageBuffer.toString('base64');

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType
            }
        };

        const prompt = 'Analyze this image and provide 3-5 keywords that describe it. Return only a single, space-separated string of keywords with no commas. For example: "cat sitting window sill".';

        console.log("Sending image to Gemini Vision...");
        const result = await geminiVisionModel.generateContent([prompt, imagePart]);
        const response = result.response;
        const rawKeywords = response.text();
        
        if (!rawKeywords) throw new Error("AI did not return any keywords.");

        const cleanedKeywords = rawKeywords.replace(/,/g, '').toLowerCase().split(' ').filter(Boolean);
        console.log(`Gemini identified keywords: "${cleanedKeywords.join(' ')}"`);

        const searchQuery = cleanedKeywords.join(' | ');

        console.log(`Searching database with query: "${searchQuery}"`);
        
        // Use the user's client. RLS is automatically applied.
        const { data, error } = await req.supabase
            .from('content_documents')
            .select('id')
            .textSearch('fts', searchQuery, {
                type: 'websearch',
                config: 'simple'
            });
        
        if (error) throw error;

        const matchingIds = data.map(item => String(item.id));
        console.log(`Found ${matchingIds.length} matching documents for user ${req.user.id}.`);
        
        res.status(200).json({
            keywords: cleanedKeywords,
            ids: matchingIds
        });
    } catch (error) {
        console.error("Error during image search:", error);
        res.status(500).json({ error: 'Failed to perform image search.' });
    }
});


// === ROUTE 3: /searchNLPSql (NEW ROBUST IMPLEMENTATION) ===
app.post('/searchNLPSql', async (req, res) => {

    const userQuery = req.body.query;
    if (!userQuery) {
        return res.status(400).json({ error: 'No query provided' });
    }
    console.log(`Got NLP query from user ${req.user.id}: "${userQuery}"`);

    // This prompt asks Gemini to structure the data, not write SQL
    const systemPrompt = `
      You are an expert query filter generator. Your task is to parse a natural language query into a JSON object.
      Respond ONLY with a valid JSON object. Do not add any other text.
      The JSON object can have these keys:
      - "fts": (string) for general full-text search.
      - "keywords_contain": (array of strings) for matching keywords.
      - "emotions_contain": (array of strings, first letter capitalized) for matching emotions.
      - "source_url_like": (string) for partial URL matching.
      - "title_like": (string) for partial title matching.
      - "startDate": (string) for date filtering (e.g., "now-7days", "2025-10-01").
      - "endDate": (string) for date filtering.
      - "source": (string) "W" or "M".
      - "favourite": (boolean).

      Examples:
      User: "stuff about AI from last week"
      {"fts": "AI", "startDate": "now-7days"}
      
      User: "show me urgent and positive data from youtube"
      {"emotions_contain": ["Urgent", "Positive"], "source_url_like": "youtube"}
      
      User: "my favourites from mobile"
      {"favourite": true, "source": "M"}
      
      User: "documents with 'React' and 'Next.js' keywords"
      {"keywords_contain": ["React", "Next.js"]}
    `;

    try {
        console.log("Sending query to Gemini for filter generation...");
        const result = await geminiTextModel.generateContent([
            systemPrompt,
            `User: "${userQuery}"`
        ]);

        const response = result.response;
        const jsonResponseText = response.text()
            .replace(/```json\n/g, '')
            .replace(/\n```/g, '')
            .trim();
        
        const filters = JSON.parse(jsonResponseText);
        console.log("Gemini generated filters:", filters);

        // --- Safely Build Supabase Query ---
        // We use req.supabase, so RLS is automatically applied (only user's data)
        let query = req.supabase.from('content_documents').select('id, created_at, metadata');

        if (filters.fts) {
            query = query.textSearch('fts', filters.fts.split(' ').join(' | '));
        }
        if (filters.keywords_contain && filters.keywords_contain.length > 0) {
            query = query.filter('metadata->keywords', 'cs', JSON.stringify(filters.keywords_contain));
        }
        if (filters.emotions_contain && filters.emotions_contain.length > 0) {
            query = query.filter('metadata->emotions', 'cs', JSON.stringify(filters.emotions_contain));
        }
        if (filters.source_url_like) {
            query = query.ilike('metadata->>source_url', `%${filters.source_url_like}%`);
        }
        if (filters.title_like) {
            query = query.ilike('metadata->>title', `%${filters.title_like}%`);
        }
        if (filters.startDate) {
            // Simple 'now-Xdays' logic. You can expand this.
            if (filters.startDate.startsWith('now-')) {
                const days = parseInt(filters.startDate.split('-')[1]);
                const date = new Date();
                date.setDate(date.getDate() - days);
                query = query.gte('created_at', date.toISOString());
            } else {
                query = query.gte('created_at', filters.startDate); // Assumes YYYY-MM-DD
            }
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate);
        }
        if (filters.source) {
            query = query.eq('source', filters.source);
        }
        // 'favourite' column doesn't exist in your schema, but if it did:
        // if (filters.favourite) {
        //     query = query.eq('favourite', true);
        // }

        // --- Execute the Query ---
        const { data: results, error: dbError } = await query;

        if (dbError) {
            console.error("Supabase query execution error:", dbError);
            return res.status(500).json({ error: `Database query failed: ${dbError.message}` });
        }

        console.log(`Successfully executed query. Found ${results?.length || 0} results.`);

        // Send back only the IDs, as in your original code
        const finalIds = results ? results.map(row => String(row.id)) : [];
        res.json({ ids: finalIds });
        
    } catch (e) {
        console.error("Error in /searchNLPSql route:", e);
        res.status(500).json({ error: 'Server error during NLP search.' });
    }
});


// --- Start the Server ---
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});