import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '../context/SupabaseContext';
import MemoryCard from '../components/MemoryCard';

const HomeScreen = ({ navigation }) => {
  const { supabase, session, memories, fetchMemories, toggleFavorite, deleteMemory } = useSupabase();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session) {
      fetchMemories();
    }
  }, [session]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMemories().finally(() => setRefreshing(false));
  };

  const handleDelete = (memoryId) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMemory(memoryId);
              Alert.alert('Success', 'Memory deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete memory');
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (memoryId) => {
    try {
      await toggleFavorite(memoryId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  // ✅ Sort: Favorites first, then newest
  const sortedMemories = [...memories].sort((a, b) => {
    const aFav = a.metadata?.favorite ? 1 : 0;
    const bFav = b.metadata?.favorite ? 1 : 0;
    if (bFav !== aFav) return bFav - aFav;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (!session) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SnapMind</Text>
        <Ionicons name="albums-outline" size={24} color="#06b6d4" />
      </View>
      
      <FlatList
        data={sortedMemories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MemoryCard 
            memory={item} 
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
          />
        )}
        // In HomeScreen.js, add this button in the header
<TouchableOpacity onPress={() => navigation.navigate('Add')} style={styles.addButton}>
  <Ionicons name="add-circle" size={28} color="#06b6d4" />
</TouchableOpacity>

// Add to styles:
addButton: {
  padding: 8,
}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#27272a" />
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first memory!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06b6d4']} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06b6d4',
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
    marginTop: 16,
  },
  emptySubtext: {
    color: '#71717a',
    fontSize: 14,
  },
});

export default HomeScreen;