import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import MemoryCard from '../components/MemoryCard';

const HomeScreen = () => {
  const { supabase, session, toggleFavorite } = useSupabase();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMemories = async () => {
    if (!session) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      Alert.alert('Error', 'Failed to load memories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Toggle favorite handler
  const handleToggleFavorite = async (memoryId) => {
    try {
      await toggleFavorite(memoryId);
      // Refresh memories after toggle
      fetchMemories();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  useEffect(() => {
    if (session) {
      fetchMemories();
    }
  }, [session]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMemories();
  };

  // ✅ Sort: Favorites first, then newest
  const sortedMemories = [...memories].sort((a, b) => {
    const aFav = a.metadata?.favorite ? 1 : 0;
    const bFav = b.metadata?.favorite ? 1 : 0;
    if (bFav !== aFav) return bFav - aFav;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedMemories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MemoryCard 
            memory={item} 
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first memory!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
  list: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#71717a',
    fontSize: 14,
  },
});

export default HomeScreen;