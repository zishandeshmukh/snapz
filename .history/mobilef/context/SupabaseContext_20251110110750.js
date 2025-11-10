import 'react-native-url-polyfill/auto';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  BACKEND_API_URL 
} from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Required for deep link auth
    },
  });

  // Handle deep links for email confirmation
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

    // Check initial URL when app opens
    Linking.getInitialURL().then(handleDeepLink);

    // Listen for URL events while app is running
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

  // ✅ NEW: Toggle favorite function
  const toggleFavorite = async (memoryId) => {
    if (!session) return;
    
    try {
      // Get current memory
      const { data: memory, error: fetchError } = await supabase
        .from('content_documents')
        .select('metadata')
        .eq('id', memoryId)
        .single();
      
      if (fetchError) throw fetchError;

      // Toggle favorite status
      const metadata = memory.metadata || {};
      const updatedMetadata = {
        ...metadata,
        favorite: !metadata.favorite,
        updated_at: new Date().toISOString(),
      };

      // Update in database
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

  // ✅ NEW: Add fake initial data (only once)
  const addFakeData = async () => {
    try {
      // Check if data already exists
      const { data: existing } = await supabase
        .from('content_documents')
        .select('id')
        .limit(1);
      
      if (existing && existing.length > 0) return; // Exit if data exists

      // Create realistic fake memories
      const fakeMemories = [
        {
          metadata: {
            title: 'Welcome to SnapMind! 🎉',
            summary: 'This is your first memory. Tap the heart icon to favorite it or click the + button to add more!',
            keywords: ['welcome', 'tutorial', 'getting-started'],
            emotions: ['excited', 'happy'],
            favorite: true,
          },
          source: 'M',
        },
        {
          metadata: {
            title: 'Meeting Notes: Q4 Strategy',
            summary: 'Discussed roadmap for mobile app launch. Key points: deep linking, share extension, offline sync. Assigned tasks to team with deadline next Friday.',
            keywords: ['work', 'meeting', 'strategy', 'deadline'],
            emotions: ['focused', 'motivated'],
            favorite: false,
          },
          source: 'W',
        },
        {
          metadata: {
            title: 'Recipe: Authentic Carbonara',
            summary: 'No cream! Just eggs, pecorino, guanciale, and black pepper. Cook pasta al dente, mix off heat. Perfect for date night.',
            keywords: ['recipe', 'food', 'italian', 'cooking'],
            emotions: ['content', 'nostalgic'],
            favorite: true,
          },
          source: 'M',
        },
        
        {
          metadata: {
            title: 'Inspiration: Design System Colors',
            summary: 'Found beautiful color palette on Dribbble. Primary: #06b6d4, Accent: #34d399, Background: #09090b. Use for app redesign.',
            keywords: ['design', 'colors', 'inspiration', 'ui'],
            emotions: ['creative', 'inspired'],
            favorite: false,
          },
          source: 'W',
        },
      ];

      // Insert each fake memory
      for (const memory of fakeMemories) {
        const { error } = await supabase
          .from('content_documents')
          .insert([{
            user_id: session.user.id,
            metadata: memory.metadata,
            source: memory.source,
            created_at: new Date().toISOString(),
          }]);
        
        if (error) throw error;
      }

      console.log('✅ Fake data added successfully!');
    } catch (error) {
      console.error('Error adding fake data:', error);
    }
  };

  // ✅ Call addFakeData after session is loaded
  useEffect(() => {
    if (session && !loading) {
      addFakeData();
    }
  }, [session, loading]); // Run when session becomes available

  // ✅ NEW: Complete logout with full cleanup
  const logout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      await AsyncStorage.multiRemove([
        'supabase.auth.token',
        'sb-jkzevomdrjxapdfeftjc-auth-token', // Your project-specific key
      ]);
      
      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      
      // Reset session state
      setSession(null);
      
      console.log('✅ Logout successful - all data cleared');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout completely');
    }
  };

  const value = {
    supabase,
    session,
    loading,
    getAuthToken: () => session?.access_token || null,
    logout,
    toggleFavorite, // ✅ Expose favorite function
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