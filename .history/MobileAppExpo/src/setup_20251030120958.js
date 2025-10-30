// Apply React Native polyfills required by supabase-js
// Must run before supabase client is created/imported anywhere.
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Note: avoid adding heavy global polyfills here. The two imports above are
// the ones required to make `@supabase/supabase-js` work reliably on RN/Expo.
