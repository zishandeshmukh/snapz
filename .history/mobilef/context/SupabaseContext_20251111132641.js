// SupabaseContext.js
import 'react-native-url-polyfill/auto';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, REDIRECT_URL } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { AppState, Alert } from 'react-native';
import { getMemories } from '../utils/backend'; 
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

  /* ---------- 1.  deep-link handler ---------- */
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

  /* ---------- 2.  auth-state listener  ---------- */
  useEffect(() => {
    let mounted = true;

    // initial session
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      if (mounted) {
        setSession(initial);
        setLoading(false);
        if (initial) fetchMemories(initial);
      }
    });

    // real-time updates – this is what you were missing
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession) fetchMemories(newSession);
      else setMemories([]);
    });

    // app-state refresh
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      appSub.remove();
    };
  }, []);

  /* ---------- 3.  memories CRUD ---------- */
 const fetchMemories = async (activeSession = session) => {
  if (!activeSession) return;
  try {
    const data = await getMemories(activeSession.access_token);
    setMemories(data);
  } catch (e) {
    Alert.alert('Backend unreachable', e.message);
    setMemories([]);
  }
};
  const toggleFavorite = async (memoryId) => {
    if (!session) throw new Error('Not authenticated');
    const { data: memory } = await supabase
      .from('content_documents')
      .select('metadata')
      .eq('id', memoryId)
      .single();
    if (!memory) throw new Error('Memory not found');
    const updatedMetadata = { ...memory.metadata, favorite: !memory.metadata?.favorite };
    const { error } = await supabase
      .from('content_documents')
      .update({ metadata: updatedMetadata })
      .eq('id', memoryId);
    if (error) throw error;
    setMemories(prev => prev.map(m => (m.id === memoryId ? { ...m, metadata: updatedMetadata } : m)));
  };

  const deleteMemory = async (memoryId) => {
    if (!session) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('content_documents')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', session.user.id);
    if (error) throw error;
    setMemories(prev => prev.filter(m => m.id !== memoryId));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMemories([]);
  };

  /* ---------- 4.  context value ---------- */
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

  return <SupabaseContext.Provider value={value}>{!loading && children}</SupabaseContext.Provider>;
};

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used inside SupabaseProvider');
  return ctx;
};