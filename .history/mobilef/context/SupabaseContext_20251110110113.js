// import 'react-native-url-polyfill/auto';
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { createClient } from '@supabase/supabase-js';
// import { SUPABASE_URL, SUPABASE_ANON_KEY, REDIRECT_URL } from '../utils/constants';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Linking from 'expo-linking';

// const SupabaseContext = createContext(null);

// export const SupabaseProvider = ({ children }) => {
//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
//     auth: {
//       storage: AsyncStorage,
//       autoRefreshToken: true,
//       persistSession: true,
//       detectSessionInUrl: true, // ✅ CRITICAL: Must be true for mobile
//     },
//   });

//   // ✅ NEW: Handle deep links for auth confirmation
//   useEffect(() => {
//     const handleDeepLink = async (url) => {
//       if (!url) return;
      
//       // Check if it's an auth callback
//       if (url.includes('access_token') || url.includes('type=signup')) {
//         const params = new URLSearchParams(url.split('#')[1]);
//         const access_token = params.get('access_token');
//         const refresh_token = params.get('refresh_token');
        
//         if (access_token && refresh_token) {
//           await supabase.auth.setSession({ access_token, refresh_token });
//         }
//       }
//     };

//     // Handle initial URL when app opens
//     Linking.getInitialURL().then(handleDeepLink);

//     // Listen for URL changes while app is running
//     const subscription = Linking.addEventListener('url', (event) => {
//       handleDeepLink(event.url);
//     });

//     return () => subscription.remove();
//   }, [supabase]);

//   useEffect(() => {
//     setLoading(true);
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setLoading(false);
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const value = {
//     supabase,
//     session,
//     loading,
//     getAuthToken: () => session?.access_token || null,
//   };

//   return (
//     <SupabaseContext.Provider value={value}>
//       {!loading && children}
//     </SupabaseContext.Provider>
//   );
// };

// export const useSupabase = () => {
//   const context = useContext(SupabaseContext);
//   if (context === undefined) {
//     throw new Error('useSupabase must be used within a SupabaseProvider');
//   }
//   return context; 
// };
// mobilef/context/SupabaseContext.js
import 'react-native-url-polyfill/auto';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Keep this true for deep link handling
    },
  });
// Add this function after useEffect:
const addFakeData = async () => {
  const { data: existing } = await supabase
    .from('content_documents')
    .select('*')
    .limit(1);
  
  if (existing && existing.length > 0) return; // Don't add if data exists

  const fakeMemories = [
    {
      title: 'Welcome to SnapMind! 🎉',
      summary: 'This is your first memory. Tap the heart to favorite it!',
      keywords: ['welcome', 'tutorial'],
      emotions: ['excited', 'happy'],
      source: 'M',
      favorite: true,
    },
    {
      title: 'Meeting Notes - Project Alpha',
      summary: 'Discussed Q4 roadmap. Key deliverables: mobile app launch, share extension, search improvements.',
      keywords: ['work', 'meeting', 'project'],
      emotions: ['focused'],
      source: 'W',
      favorite: false,
    },
    {
      title: 'Recipe: Spaghetti Carbonara',
      summary: 'Best carbonara recipe! 4 eggs, 200g pancetta, 100g parmesan. No cream!',
      keywords: ['recipe', 'food', 'italian'],
      emotions: ['content'],
      source: 'M',
      favorite: true,
    },
  ];

  const token = getAuthToken();
  if (!token) return;

  for (const memory of fakeMemories) {
    await saveDataToBackend(memory, token);
  }
};

// Call it after session is loaded:
useEffect(() => {
  setLoading(true);
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setLoading(false);
    if (session) addFakeData(); // ✅ Add fake data on first login
  });
}, []);
  // Handle deep links for auth confirmation
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;
      
      if (url.includes('access_token') || url.includes('type=signup')) {
        const params = new URLSearchParams(url.split('#')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ 
            access_token, 
            refresh_token 
          });
          if (error) console.error('Auth error:', error);
        }
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [supabase]);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ NEW: Logout function
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    setSession(null);
  };

  const value = {
    supabase,
    session,
    loading,
    getAuthToken: () => session?.access_token || null,
    logout, // ✅ Add logout to context
  };
const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
  
  // ✅ Clear ALL session data
  await AsyncStorage.clear(); // Clear local storage
  setSession(null); // Clear state
  supabase.auth.setSession(null); // Clear Supabase session
};
  return (
    <SupabaseContext.Provider value={value}>
      {!loading && children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context; 
};