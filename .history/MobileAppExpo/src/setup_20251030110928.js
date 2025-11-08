// Apply React Native polyfills required by supabase-js
// Must run before supabase client is created/imported anywhere.
try {
  // random values for crypto (used by auth)
  import 'react-native-get-random-values';
  // URL and globals polyfill
  import 'react-native-url-polyfill/auto';
} catch (e) {
  // In case dynamic import is not allowed, fall back to require
  try { require('react-native-get-random-values'); } catch (e2) {}
  try { require('react-native-url-polyfill/auto'); } catch (e3) {}
}

// Optionally, set global atob/btoa for some libs (Expo usually has them)
if (typeof global.atob === 'undefined') {
  global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof global.btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
