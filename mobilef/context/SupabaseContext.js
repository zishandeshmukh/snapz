import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Required for Supabase in React Native
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
import { deriveType } from '../utils/shareUtils';

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  // Initialize the Supabase client
  const [supabase] = useState(() => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch data from the database
  const fetchMemories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data just like you do on the web
      const transformed = data.map(item => ({
        id: String(item.id),
        title: item.metadata?.title || 'Untitled',
        summary: item.metadata?.summary || '',
        keywords: item.metadata?.keywords || [],
        emotion: item.metadata?.emotions?.[0] || '',
        timestamp: item.metadata?.timestamp || item.created_at,
        url: item.metadata?.source_url || '',
        type: deriveType(item.metadata?.source_url),
        favorite: item.favorite || false,
      }));

      setMemories(transformed);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle the 'favorite' status
  const toggleFavorite = async (id) => {
    const item = memories.find(m => m.id === id);
    if (!item) return;

    const newStatus = !item.favorite;

    // Optimistically update the UI
    setMemories(prev => 
      prev.map(m => m.id === id ? { ...m, favorite: newStatus } : m)
    );

    // Update the database
    try {
      const { error } = await supabase
        .from('content_documents')
        .update({ favorite: newStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert the UI if the database update fails
      setMemories(prev => 
        prev.map(m => m.id === id ? { ...m, favorite: !newStatus } : m)
      );
    }
  };

  // Function to delete a memory
  const deleteMemory = async (id) => {
    // Optimistically remove from UI
    const previousMemories = memories;
    setMemories(prev => prev.filter(m => m.id !== id));

    try {
      const { error } = await supabase
        .from('content_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting memory:', error);
      // Revert the UI if the delete fails
      setMemories(previousMemories);
    }
  };

  // Fetch data when the app loads
  useEffect(() => {
    fetchMemories();

    // Set up a real-time listener for any changes
    const channel = supabase
      .channel('content_documents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_documents' },
        (payload) => {
          console.log('Realtime change received!', payload);
          // Re-fetch all data to stay in sync
          fetchMemories();
        }
      )
      .subscribe();

    // Cleanup the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        memories,
        loading,
        fetchMemories,
        toggleFavorite,
        deleteMemory,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
