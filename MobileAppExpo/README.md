# SnapMind Mobile (Expo) — Quick start

This is a ready-to-run Expo JS scaffold for the SnapMind mobile app. It connects to the same Supabase `content_documents` table and can POST mobile shares to your backend `/mobile/share` endpoint.

Before running
1. Copy the anon key from `Frontend/.env` (VITE_SUPABASE_ANON_KEY) and paste it into `MobileAppExpo/src/lib/config.js` as `SUPABASE_ANON_KEY`.
2. If you run the backend locally and test on Android emulator, set `BACKEND_BASE` to `http://10.0.2.2:3001`. If you test on a real device, use your machine LAN IP (e.g. `http://192.168.1.100:3001`).

Install & run (PowerShell)

```powershell
cd MobileAppExpo
npm install
# Start Expo (tunnel recommended for physical devices)
npm run start

# Optional: run on android emulator (requires Android SDK configured)
npm run android
```

Notes
- This is a JS-only scaffold using Expo — it's much faster to run and iterate than creating RN native projects.
- For production native share-target/extension support you'll need to eject or use EAS Build with native modules. I can scaffold native share wiring once you confirm you want native integration.
