// This is the correct Supabase project URL
export const SUPABASE_URL = 'https://jkzevomdrjxapdfeftjc.supabase.co';

// This is the ANON_KEY for that correct project
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpremV2b21kcmp4YXBkZmVmdGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTU2MDUsImV4cCI6MjA3Njg5MTYwNX0.b_DEX5rr6cFUeFqM_ABfWcrfCkz0CDnWgRnvk8hFbY0';

// --- API URL Configuration ---

// Use this for iOS Simulator
// export const API_URL = 'http://localhost:10000';
// export const API_URL = 'http://localhost:10000';
// Use this for Android Emulator
// export const API_URL = 'http://10.0.2.2:10000';

// Use this for testing on a PHYSICAL PHONE (like Expo Go) on the same network
const YOUR_COMPUTER_IP = '10.30.206.76'; // --- This must be your computer's local network IP ---
export const API_URL = `http://${YOUR_COMPUTER_IP}:10000`;