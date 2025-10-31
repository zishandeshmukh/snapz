// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { createClient } from '@supabase/supabase-js';
// import 'react-native-url-polyfill/auto';
// import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';
// import { deriveType } from '../utils/shareUtils';

// const SupabaseContext = createContext();

// export const useSupabase = () => {
//   const context = useContext(SupabaseContext);
//   if (!context) {
//     throw new Error('useSupabase must be used within SupabaseProvider');
//   }
//   return context;
// };

// export const SupabaseProvider = ({ children }) => {
//   const [supabase] = useState(() => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
//   const [memories, setMemories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchMemories = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('content_documents')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       const transformed = data.map(item => ({
//         id: String(item.id),
//         title: item.metadata?.title || 'Untitled',
//         summary: item.metadata?.summary || '',
//         keywords: item.metadata?.keywords || [],
//         emotion: item.metadata?.emotions?.[0] || '',
//         timestamp: item.metadata?.timestamp || item.created_at,
//         url: item.metadata?.source_url || '',
//         type: deriveType(item.metadata?.source_url),
//         favorite: item.favorite || false,
//       }));

//       setMemories(transformed);
//     } catch (error) {
//       console.error('Error fetching memories:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleFavorite = async (id) => {
//     const item = memories.find(m => m.id === id);
//     if (!item) return;

//     const newStatus = !item.favorite;

//     setMemories(prev => 
//       prev.map(m => m.id === id ? { ...m, favorite: newStatus } : m)
//     );

//     try {
//       const { error } = await supabase
//         .from('content_documents')
//         .update({ favorite: newStatus })
//         .eq('id', id);

//       if (error) throw error;
//     } catch (error) {
//       console.error('Error toggling favorite:', error);
//       setMemories(prev => 
//         prev.map(m => m.id === id ? { ...m, favorite: !newStatus } : m)
//       );
//     }
//   };

//   const deleteMemory = async (id) => {
//     setMemories(prev => prev.filter(m => m.id !== id));

//     try {
//       const { error } = await supabase
//         .from('content_documents')
//         .delete()
//         .eq('id', id);

//       if (error) throw error;
//     } catch (error) {
//       console.error('Error deleting memory:', error);
//       await fetchMemories();
//     }
//   };

//   useEffect(() => {
//     fetchMemories();
//   }, []);

//   return (
    
//       {children}
    
//   );
// };
import React, { createContext, useContext, useState, useEffect } from 'react';
// We are NOT importing Supabase or constants, so the app won't crash

// 1. --- Create some fake "mock" data to display ---
const MOCK_MEMORIES = [
  {
    id: '1',
    title: 'My First Mocked Memory',
    summary: 'This is a summary for the first memory. It is loaded from fake data inside the SupabaseContext file.',
    keywords: ['mock', 'react native', 'demo'],
    emotion: 'Positive',
    timestamp: new Date().toISOString(),
    url: 'https.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'youtube',
    favorite: true,
  },
  {
    id: '2',
    title: 'A Second Memory Card',
    summary: 'This one is an article about Expo. The UI will look great even with fake data.',
    keywords: ['expo', 'article'],
    emotion: 'Informative',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    url: 'https.expo.dev',
    type: 'article',
    favorite: false,
  },
  {
    id: '3',
    title: 'Just a Plain Text Note',
    summary: 'This is a simple text note without a URL.',
    keywords: ['note', 'text'],
    emotion: 'Thoughtful',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    url: '',
    type: 'text',
    favorite: false,
  },
];
// --- End of fake data ---

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  // 2. --- Load the fake data into state ---
  const [memories, setMemories] = useState(MOCK_MEMORIES);
  const [loading, setLoading] = useState(false); // Set loading to false

  // 3. --- Create empty functions so the app doesn't crash ---
  const fetchMemories = async () => {
    console.log('Mock fetch: Not fetching from Supabase');
    setLoading(true);
    setTimeout(() => {
      setMemories(MOCK_MEMORIES); // Just reload the mock data
      setLoading(false);
    }, 500);
  };

  const toggleFavorite = async (id) => {
    console.log('Mock toggle favorite for:', id);
    setMemories(prev =>
      prev.map(m => (m.id === id ? { ...m, favorite: !m.favorite } : m))
    );
  };

  const deleteMemory = async (id) => {
    console.log('Mock delete memory:', id);
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  // We don't run fetchMemories on load, since we already have mock data
  useEffect(() => {
    // This is now empty on purpose
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        supabase: null, // No real Supabase client
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
