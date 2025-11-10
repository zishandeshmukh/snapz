// --- IMPORTANT ---
// 1. This is your computer's IP address, as a string
const YOUR_COMPUTER_IP = '10.30.206.76';

// 2. This is the correct Supabase project URL (NO trailing space!)
export const SUPABASE_URL = 'https://jkzevomdrjxapdfeftjc.supabase.co';

// 3. This is the ANON_KEY for that correct project
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpremV2b21kcmp4YXBkZmVmdGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTU2MDUsImV4cCI6MjA3Njg5MTYwNX0.b_DEX5rr6cFUeFqM_ABfWcrfCkz0CDnWgRnvk8hFbY0';

// 4. Backend API URL
export const BACKEND_API_URL = `http://${YOUR_COMPUTER_IP}:3001`;

// 5. ✅ NEW: Auth redirect URL for email confirmations
export const REDIRECT_URL = `exp://${YOUR_COMPUTER_IP}:8081`; // For Expo Go
// For production, use: export const REDIRECT_URL = 'snapmind://auth-callback';