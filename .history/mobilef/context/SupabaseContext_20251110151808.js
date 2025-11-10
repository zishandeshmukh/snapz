import 'react-native-url-polyfill/auto';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, REDIRECT_URL } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

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
      detectSessionInUrl: false, // Changed to false for mobile
    },
  });

  // ✅ IMPROVED: Deep link handling
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;
      
      if (url.includes('access_token')) {
        const params = new URLSearchParams(url.split('#')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ 
            access_token, 
            refresh_token 
          });
          if (error) console.error('Auth session error:', error);
        }
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [supabase]);

  // ✅ CRITICAL: Load session properly
  useEffect(() => {
    let mounted = true;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
        if (session) fetchMemories();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        if (!session) {
          setMemories([]); // Clear data on logout
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Toggle favorite
  const toggleFavorite = async (memoryId) => {
    if (!session) throw new Error("Not authenticated");
    
    const { data: memory } = await supabase
      .from('content_documents')
      .select('metadata')
      .eq('id', memoryId)
      .single();
    
    if (!memory) throw new Error("Memory not found");

    const updatedMetadata = {
      ...memory.metadata,
      favorite: !memory.metadata?.favorite,
    };

    const { error } = await supabase
      .from('content_documents')
      .update({ metadata: updatedMetadata })
      .eq('id', memoryId);
    
    if (error) throw error;
    
    // Update local state
    setMemories(prev => prev.map(m => 
      m.id === memoryId ? { ...m, metadata: updatedMetadata } : m
    ));
  };

  // ✅ Delete memory
  const deleteMemory = async (memoryId) => {
    if (!session) throw new Error("Not authenticated");
    
    const { error } = await supabase
      .from('content_documents')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', session.user.id);
    
    if (error) throw error;
    
    setMemories(prev => prev.filter(m => m.id !== memoryId));
  };

  // ✅ Fetch memories
  const fetchMemories = async () => {
    if (!session) return;
    
    const { data, error } = await supabase
      .from('content_documents')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setMemories(data || []);
  };

  // ✅ PROPER LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.clear();
    setSession(null);
    setMemories([]);
  };

  const value = {
    supabase,
    session,
    loading,
    memories,
    getAuthToken: () => session?.access_token || null,
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
  const context = useContext(SupabaseContext);
  if (!context) throw new Error('useSupabase must be used within SupabaseProvider');
  return context;
};