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
