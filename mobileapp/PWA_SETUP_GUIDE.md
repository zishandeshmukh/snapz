# PWA Share Target Setup Guide

Your Expo Web project is now configured as a Progressive Web App (PWA) with Web Share Target API support. This allows your app to receive shared content (URLs, titles, text) directly from your phone's share menu.

## What Was Set Up

### 1. PWA Configuration Files
- **`public/manifest.json`** - Web app manifest with Share Target API configuration
- **`public/service-worker.js`** - Service worker for offline support and caching
- **`public/icon.png`** - App icon for the PWA

### 2. Updated Configuration
- **`app.json`** - Changed to server output mode to support API routes and PWA features
- **`app/_layout.tsx`** - Added service worker registration

### 3. API Route & Share Page
- **`app/share+api.ts`** - API endpoint that receives POST requests with shared content
- **`app/share.tsx`** - UI page that displays share status and feedback

## How It Works

### From Your Phone
1. Share a URL from Chrome, Safari, Instagram, LinkedIn, or any app that supports Web Share
2. Select your app from the share menu (it will appear as "bolt-expo-starter" or "Starter")
3. The shared content is sent to your backend
4. You see a confirmation page

### Behind the Scenes
```
Phone Share Menu → Web Share Target API → /share+api.ts → Supabase (or your backend)
```

## Key Features

### Share Target Parameters
The manifest is configured to capture three pieces of data:
- **`url`** - The URL being shared (required)
- **`title`** - The page title or app name (optional)
- **`text`** - Description or body text (optional)

### API Endpoint
**POST /share**

The endpoint currently:
1. Receives shared data via multipart form data
2. Validates the URL (required field)
3. Stores data temporarily in memory
4. Returns a success/error response

### Redirects
After sharing, users are automatically redirected to your home page after 2 seconds.

## Next Steps: Integrate with Your Backend

### 1. Set Up Database Table
Create a table in Supabase to store shared items:

```sql
CREATE TABLE IF NOT EXISTS shared_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  title text,
  description text,
  source text DEFAULT 'mobile_share',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE shared_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares"
  ON shared_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Update the API Route
In `app/share+api.ts`, uncomment and update the Supabase insert section:

```typescript
const { data, error } = await supabase
  .from('shared_items')
  .insert([sharedContent]);

if (error) {
  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}
```

### 3. Add AI Processing
Replace the TODO comment in `share+api.ts` with your AI pipeline:

```typescript
// Process through your AI pipeline
const processed = await processWithAI(url, title, text);

// Then store
const { data, error } = await supabase
  .from('shared_items')
  .insert([{
    ...sharedContent,
    ai_analysis: processed
  }]);
```

## Deployment

### Local Testing
```bash
npm run build:web
npm run dev
```

Then visit `http://localhost:8081` on your phone and add it to the home screen.

### Production Deployment
1. Build: `npm run build:web`
2. The `dist` folder contains your static and server files
3. Deploy to a hosting platform that supports Node.js server output (Vercel, Netlify, etc.)
4. Ensure your manifest is served with proper MIME type (usually automatic)
5. Use HTTPS in production (required for PWA and service workers)

## Browser/Device Support

### Share Target API Support
- **Android**: Chrome, Edge, Samsung Internet
- **iOS**: Not yet supported in Safari (use PWA + Web Share API instead)
- **Desktop**: Some browsers with experimental flags

### Service Worker Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Required for offline functionality and PWA installation

## Troubleshooting

### App doesn't appear in share menu
- Ensure you're on Android with a supported browser (Chrome, Edge, Samsung Internet)
- The app must be installed as a PWA first (add to home screen)
- Check browser settings for PWA support

### Shared data not received
- Verify `/share` API route is accessible
- Check browser console for errors
- Ensure network connectivity between device and server

### Service worker not registering
- Check browser DevTools → Application → Service Workers
- Clear site data and try again
- Service worker requires HTTPS in production

## File Structure
```
project/
├── app/
│   ├── _layout.tsx (service worker registration)
│   ├── share+api.ts (API endpoint)
│   ├── share.tsx (share feedback page)
│   └── ...
├── public/
│   ├── manifest.json (PWA config with Share Target)
│   ├── service-worker.js (offline support)
│   └── icon.png (app icon)
└── app.json (server output enabled)
```
