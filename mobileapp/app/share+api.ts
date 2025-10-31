import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const title = formData.get('title') as string;
    const text = formData.get('text') as string;

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Process the shared content through your AI pipeline
    // For now, store the raw data
    const sharedContent = {
      url,
      title: title || null,
      description: text || null,
      source: 'mobile_share',
      created_at: new Date().toISOString(),
    };

    // TODO: Replace 'shared_items' with your actual table name
    // const { data, error } = await supabase
    //   .from('shared_items')
    //   .insert([sharedContent]);

    // if (error) {
    //   return new Response(
    //     JSON.stringify({ error: error.message }),
    //     { status: 500, headers: { 'Content-Type': 'application/json' } }
    //   );
    // }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Content shared successfully',
        data: sharedContent,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
