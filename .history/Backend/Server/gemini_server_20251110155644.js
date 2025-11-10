// gemini_server.js
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// ----------  NEW: refuse to start if critical vars are missing ----------
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}
// -----------------------------------------------------------------------

// --- Free Tier Configuration ---
const MAX_GEMINI_CALLS_PER_MINUTE = 60;
const MAX_REQUESTS_PER_USER_PER_MINUTE = 5;
const BATCH_SIZE = 5;
const CONNECTION_POOL = { min: 0, max: 2 };

// --- Initialize Clients ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Admin client (no fallback strings)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { db: { schema: 'public', pool: CONNECTION_POOL } }
);

// --- Rate Limiting Store ---
const rateLimits = new Map();
const geminiCallsThisMinute = { count: 0, timestamp: Date.now() };

// --- Express App ---
const app = express();
const PORT = process.env.PORT || 10000;

// --- Middleware ---
app.use(
  cors({
    origin: ['chrome-extension://*', 'http://localhost:3000', 'http://localhost:8081', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Rate limiting middleware (unchanged)
app.use((req, res, next) => {
  const now = Date.now();
  if (now - geminiCallsThisMinute.timestamp > 60000) {
    geminiCallsThisMinute.count = 0;
    geminiCallsThisMinute.timestamp = now;
  }
  if (geminiCallsThisMinute.count >= MAX_GEMINI_CALLS_PER_MINUTE) {
    return res.status(429).json({ error: 'AI service temporarily unavailable' });
  }

  const ip = req.ip;
  const userLimit = rateLimits.get(ip) || { count: 0, timestamp: now };
  if (now - userLimit.timestamp > 60000) {
    userLimit.count = 0;
    userLimit.timestamp = now;
  }
  if (userLimit.count >= MAX_REQUESTS_PER_USER_PER_MINUTE) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  userLimit.count++;
  rateLimits.set(ip, userLimit);
  next();
});

// --- Authentication Middleware ---
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  req.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await req.supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid session' });

  req.user = user;
  next();
};

// Protected routes
app.use('/receive_data', authenticateUser);
app.use('/searchNLPSql', authenticateUser);
app.use('/searchByImage', authenticateUser);

// --- AI Summarisation (batched) --- (unchanged)
let pendingBatch = [];
let batchTimer = null;

app.post('/receive_data', async (req, res) => {
  const { rawText, source } = req.body;
  if (!rawText || rawText.length < 20) return res.status(400).json({ error: 'Text too short' });
  if (!source || !['W', 'M'].includes(source)) return res.status(400).json({ error: 'Invalid source' });

  pendingBatch.push({ rawText, source, userId: req.user.id, res });
  if (batchTimer) clearTimeout(batchTimer);
  batchTimer = setTimeout(processBatch, 30000);
  if (pendingBatch.length >= BATCH_SIZE) {
    clearTimeout(batchTimer);
    await processBatch();
  }
});

async function processBatch() {
  if (!pendingBatch.length) return;
  const batch = [...pendingBatch];
  pendingBatch = [];

  if (geminiCallsThisMinute.count + batch.length > MAX_GEMINI_CALLS_PER_MINUTE) {
    batch.forEach((item) => item.res.status(429).json({ error: 'AI quota exceeded' }));
    return;
  }

  try {
    const combinedText = batch
      .map((item, i) => `ITEM ${i} [USER:${item.userId.substring(0, 8)}]:\n${item.rawText.substring(0, 500)}`)
      .join('\n\n---\n\n');

    geminiCallsThisMinute.count++;
    const result = await geminiModel.generateContent([
      {
        text: `ANALYZE_AND_RETURN_VALID_JSON_ARRAY_ONLY:
      
      You are a data analysis engine. For each item, return:
      {
        "title": "5-word max",
        "summary": "2-sentence summary", 
        "keywords": ["tag1", "tag2"],
        "emotions": ["emotion1", "emotion2"],
        "category": "note|article|idea|link",
        "source_url": "extracted URL or null"
      }
      
      Return a JSON array with ${batch.length} objects in order.`,
      },
      { text: combinedText },
    ]);

    const responseText = result.response.text().replace(/```json\n|\n```/g, '').trim();
    const analyses = JSON.parse(responseText);

    const inserts = batch.map((item, i) => ({
      user_id: item.userId,
      source: item.source,
      created_at: new Date().toISOString(),
      metadata: { ...analyses[i], raw_text: item.rawText },
    }));
    const { error: dbError } = await supabase.from('content_documents').insert(inserts);
    if (dbError) throw dbError;

    batch.forEach((item, i) => item.res.status(200).json({ success: true, analysis: analyses[i] }));
  } catch (error) {
    console.error('Batch processing failed:', error.message);
    batch.forEach((item) => item.res.status(500).json({ error: 'Processing failed' }));
  }
}

// --- NLP Search --- (unchanged)
app.post('/searchNLPSql', async (req, res) => {
  const { query } = req.body;
  if (!query || query.length > 200) return res.status(400).json({ error: 'Invalid query' });

  geminiCallsThisMinute.count++;
  try {
    const result = await geminiModel.generateContent([
      {
        text: `CONVERT_TO_SUPABASE_FILTER:
      
      Query: "${query}"
      
      Return ONLY JSON:
      {
        "filter": "created_at=gte.'2024-01-01'&category=eq.note"
      }
      
      Use PostgREST syntax. Include only user_id security.`,
      },
    ]);
    const filterText = result.response.text().replace(/```json\n|\n```/g, '').trim();
    const { filter } = JSON.parse(filterText);

    const { data, error } = await req.supabase.from('content_documents').select('*').filter(filter);
    if (error) throw error;
    res.json({ ids: data?.map((d) => String(d.id)) || [] });
  } catch (error) {
    console.error('Search failed:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// --- Health Check --- (unchanged)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), geminiCalls: geminiCallsThisMinute.count });
});

// --- Start Server --- (unchanged)
app.listen(PORT, () => {
  console.log(`🚀 SnapMind Backend Running`);
  console.log(`📊 Port: ${PORT}`);
  console.log(`🔒 Rate Limits: ${MAX_REQUESTS_PER_USER_PER_MINUTE} req/min/user`);
  console.log(`🤖 Gemini Calls: ${MAX_GEMINI_CALLS_PER_MINUTE}/min`);
});