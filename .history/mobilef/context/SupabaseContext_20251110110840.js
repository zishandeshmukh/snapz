// mobilef/context/SupabaseContext.js
import 'react-native-url-polyfill/auto';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native'; // ✅ Added for errors

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

  // ✅ Toggle favorite function
  const toggleFavorite = async (memoryId) => {
    if (!session) return;
    
    try {
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
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
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
          metadata: {
            title: 'Welcome to SnapMind! 🎉',
            summary: 'This is your first memory. Tap the heart to favorite it!',
            keywords: ['welcome', 'tutorial'],
            emotions: ['excited', 'happy'],
            favorite: true,
          },
          source: 'M',
          raw_text: 'Welcome to SnapMind! This is your first memory. Tap the heart icon to favorite it or click the + button to add more!',
        },
        {
          metadata: {
            title: 'Meeting Notes: Q4 Strategy',
            summary: 'Discussed roadmap for mobile app launch. Key points: deep linking, share extension, offline sync.',
            keywords: ['work', 'meeting', 'strategy'],
            emotions: ['focused', 'motivated'],
            favorite: false,
          },
          source: 'W',
          raw_text: 'Meeting Notes Q4 Strategy: Discussed roadmap for mobile app launch. Key deliverables include deep linking implementation, share extension testing, and offline sync functionality. All tasks assigned with deadline of next Friday.',
        },
        {
          metadata: {
            title: 'Recipe: Authentic Carbonara',
            summary: 'No cream! Just eggs, pecorino, guanciale, and black pepper. Perfect for date night.',
            keywords: ['recipe', 'food', 'italian', 'cooking'],
            emotions: ['content', 'nostalgic'],
            favorite: true,
          },
          source: 'M',
          raw_text: 'Recipe for Authentic Carbonara: Ingredients - 4 eggs, 200g guanciale, 100g pecorino, black pepper. Method: Cook pasta al dente, render guanciale, mix eggs and cheese, combine off heat. No cream allowed!',
        },
        {
          metadata: {
            title: 'Design Inspiration: Dark Mode',
            summary: 'Found beautiful color palette. Primary: #06b6d4, Accent: #34d399, Background: #09090b.',
            keywords: ['design', 'colors', 'inspiration', 'ui'],
            emotions: ['creative', 'inspired'],
            favorite: false,
          },
          source: 'W',
          raw_text: 'Design inspiration for dark mode color palette. Primary blue #06b6d4, accent green #34d399, dark background #09090b. Use these colors for consistent app theming and UI components.',
        },
      ];

      for (const memory of fakeMemories) {
        const { error } = await supabase
          .from('content_documents')
          .insert([{
            user_id: session.user.id,
            metadata: memory.metadata,
            source: memory.source,
            raw_text: memory.raw_text, // ✅ Must include raw_text
            created_at: new Date().toISOString(),
          }]);
        
        if (error) throw error;
      }

      console.log('✅ Fake data added successfully!');
    } catch (error) {
      console.error('Error adding fake data:', error);
    }
  };

  // Call addFakeData when session is available
  useEffect(() => {
    if (session && !loading) {
      addFakeData();
    }
  }, [session, loading]);

  // ✅ NEW: Complete logout with session cleanup
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all local storage
      await AsyncStorage.multiRemove([
        'supabase.auth.token',
        `sb-${SUPABASE_URL.split('.')[0].split('//')[1]}-auth-token`,
      ]);
      
      // Clear everything else
      await AsyncStorage.clear();
      
      setSession(null);
      console.log('✅ Logout successful - all data cleared');
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