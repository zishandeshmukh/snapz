// src/lib/config.js

/**
 * Supabase URL. From your .env file.
 */
export const SUPABASE_URL = 'https://mskpemejwjjexehnwbrk.supabase.co'; [cite: 1]

/**
 * Supabase Anon Key (public). From your .env file.
 */
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1za3BlbWVqd2pqZXhlaG53YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTU2MzcsImV4cCI6MjA3NTY3MTYzN30.xRlegin92kE8cZJ5Scv90Pu4XQs_O_Qd-fWpI84jDFw'; [cite: 1]

/**
 * Base URL for your backend API.
 * This is NOT in your .env file. You must set it yourself.
 *
 * - Android Emulator: 'http://10.0.2.2:3001'
 * - Physical Device: 'http://[YOUR_COMPUTER_LAN_IP]:3001'
 */
export const BACKEND_BASE = 'http://10.0.2.2:3001'; // <-- IMPORTANT: Change this if using a real device