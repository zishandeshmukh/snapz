// SupabaseContext.js
import 'react-native-url-polyfill/auto';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { AppState, Alert } from 'react-native';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState([]);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  /* 1.  deep-link helper (unchanged) */
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;
      if (url.includes('access_token')) {
        const params = new URLSearchParams(url.split('#')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) console.error('Deep-link session error:', error);
        }
      }
    };
    Linking.getInitialURL().then(handleDeepLink);
    const sub = Linking.addEventListener('url', (e) => handleDeepLink(e.url));
    return () => sub.remove();
  }, []);

  /* 2.  CRITICAL: listen to every auth change */
  useEffect(() => {
    let mounted = true;

    // initial session
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
        if (data.session) fetchMemories(data.session);
      }
    });

    // real-time updates
+   const { data: listener } = supabase.auth.onAuthStateChange(
+     (_event, newSession) => {
+       if (mounted) {
+         setSession(newSession);
+         if (newSession) fetchMemories(newSession);
+         else setMemories([]);
+       }
+     }
+   );

    // app-state refresh
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => {
      mounted = false;
+     listener.subscription.unsubscribe();
      appSub.remove();
    };
  }, []);

  /* 3.  accept session param so we can call it from inside the effect */
- const fetchMemories = async () => {
+ const fetchMemories = async (activeSession = session) => {
-   if (!session) return;
+   if (!activeSession) return;
    const { data, error } = await supabase
      .from('content_documents')
      .select('*')
-     .eq('user_id', session.user.id)
+     .eq('user_id', activeSession.user.id)
      .order('created_at', { ascending: false });
    if (error) return Alert.alert('Error', error.message);
    setMemories(data || []);
  };

  /* 4.  keep the rest unchanged */
  const toggleFavorite = async (memoryId) => { ... };
  const deleteMemory  = async (memoryId) => { ... };
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMemories([]);
  };

  const value = {
    supabase,
    session,
    loading,
    memories,
    getAuthToken: () => session?.access_token ?? null,
    logout,
    toggleFavorite,
    deleteMemory,
    fetchMemories,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {!loading && children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used inside SupabaseProvider');
  return ctx;
};