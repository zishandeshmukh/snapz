import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BACKEND_BASE } from './config';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function ensureSupabaseKey() {
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('REPLACE')) {
    throw new Error("SUPABASE_ANON_KEY is not set. Edit src/lib/config.js and paste your project's anon key (from Frontend/.env VITE_SUPABASE_ANON_KEY).\nExample: export const SUPABASE_ANON_KEY = 'eyJ...';");
  }
}

export async function fetchDocuments() {
  ensureSupabaseKey();
  const { data, error } = await supabase
    .from('content_documents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  // transform to mobile item shape similar to web
  return data.map(dbItem => {
    const meta = dbItem.metadata || {};
    return {
      id: String(dbItem.id),
      title: meta.title,
      summary: meta.summary,
      keywords: meta.keywords || [],
      emotion: meta.emotions ? meta.emotions[0] : undefined,
      timestamp: meta.timestamp,
      url: meta.source_url,
      favorite: dbItem.favorite || false
    };
  });
}

export async function toggleFavorite(id) {
  ensureSupabaseKey();
  const { error } = await supabase
    .from('content_documents')
    .update({ favorite: true })
    .eq('id', id);
  if (error) throw error;
}

// Send a share payload to the backend /mobile/share endpoint
export async function sendShare(payload, apiKey = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const res = await fetch(`${BACKEND_BASE.replace(/\/$/, '')}/mobile/share`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}
