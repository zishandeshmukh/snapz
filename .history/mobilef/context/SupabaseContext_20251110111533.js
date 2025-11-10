import 'react-native-url-polyfill/auto';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

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

  // Load session on mount
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

  // ✅ Toggle favorite
  const toggleFavorite = async (memoryId) => {
    if (!session) return;
    
    const { data: memory, error: fetchError } = await supabase
      .from('content_documents')
      .select('metadata')
      .eq('id', memoryId)
      .single();
    
    if (fetchError) throw fetchError;

    const metadata = memory.metadata || {};
    const updatedMetadata = {
      ...metadata,
      favorite: !metadata.favorite,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('content_documents')
      .update({ metadata: updatedMetadata })
      .eq('id', memoryId);
    
    if (error) throw error;
  };

  // ✅ FIXED: Add fake data with raw_text
  const addFakeData = async () => {
    try {
      const { data: existing } = await supabase
        .from('content_documents')
        .select('id')
        .limit(1);
      
      if (existing && existing.length > 0) return;

      const fakeMemories = [
        {
          user_id: session.user.id,
          metadata: {
            title: 'Welcome to SnapMind! 🎉',
            summary: 'Your first memory. Tap the heart to favorite!',
            keywords: ['welcome', 'tutorial'],
            emotions: ['excited', 'happy'],
            favorite: true,
          },
          source: 'M',
          raw_text: 'Welcome to SnapMind! Tap the heart icon to favorite this memory or use the + button to add new ones. This is your tutorial memory to get started.',
        },
        {
          user_id: session.user.id,
          metadata: {
            title: 'Project Alpha Meeting Notes',
            summary: 'Q4 roadmap: mobile launch, share extension, offline sync',
            keywords: ['work', 'meeting', 'project'],
            emotions: ['focused'],
            favorite: false,
          },
          source: 'W',
          raw_text: 'Project Alpha meeting notes from today. Discussed Q4 roadmap including mobile app launch timeline, share extension implementation, offline sync functionality, and assigned all tasks with deadline next Friday.',
        },
        {
          user_id: session.user.id,
          metadata: {
            title: 'Spaghetti Carbonara Recipe',
            summary: 'Authentic recipe - no cream! Eggs, pecorino, guanciale, pepper',
            keywords: ['recipe', 'food', 'italian'],
            emotions: ['content', 'nostalgic'],
            favorite: true,
          },
          source: 'M',
          raw_text: 'My authentic carbonara recipe: 4 eggs, 200g guanciale, 100g pecorino, black pepper. Cook pasta al dente, render guanciale until crispy, mix eggs and cheese, combine off heat. Perfect for date night dinner!',
        },
      ];

      for (const memory of fakeMemories) {
        const { error } = await supabase
          .from('content_documents')
          .insert([memory]);
        
        if (error) throw error;
      }

      console.log('✅ Fake data added!');
    } catch (error) {
      console.error('Error adding fake data:', error);
    }
  };

  useEffect(() => {
    if (session && !loading) {
      addFakeData();
    }
  }, [session, loading]);

  // ✅ Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await AsyncStorage.clear();
      setSession(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const value = {
    supabase,
    session,
    loading,
    getAuthToken: () => session?.access_token || null,
    logout,
    toggleFavorite,
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