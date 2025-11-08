import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import MemoryCard from '../components/MemoryCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  // Add default values to prevent crash on initial load
  const { memories, loading, fetchMemories, toggleFavorite } = useSupabase() || {
    memories: [],
    loading: true,
    fetchMemories: () => console.log('Fetching...'),
    toggleFavorite: () => console.log('Toggling fav...'),
  };

  const recent = useMemo(() => 
    memories.slice(0, 10),
    [memories]
  );

  const favorites = useMemo(() => 
    memories.filter(m => m.favorite).slice(0, 10),
    [memories]
  );

  // FIX: This was the broken return statement.
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={fetchMemories}
          tintColor="#06b6d4"
        />
      }
    >
      <LinearGradient
        colors={['#0891b2', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>Your Personal Digital Memory</Text>
        <Text style={styles.heroSubtitle}>
          All your captured moments, organized and searchable
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>Total Memories</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent</Text>
        {loading && recent.length === 0 ? (
          <ActivityIndicator color="#06b6d4" style={{ marginVertical: 20 }} />
        ) : recent.length === 0 ? (
          <Text style={styles.emptyText}>No memories yet. Start capturing!</Text>
        ) : (
          recent.map(item => (
            <MemoryCard 
              key={item.id} 
              item={item} 
              onToggleFav={toggleFavorite}
            />
          ))
        )}
      </View>

      {favorites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorites</Text>
          {favorites.map(item => (
            <MemoryCard 
              key={item.id} 
              item={item} 
              onToggleFav={toggleFavorite}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  hero: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#e4e4e7',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#e4e4e7',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 12,
  },
  emptyText: {
    color: '#71717a',
    textAlign: 'center',
    padding: 20,
  },
});

