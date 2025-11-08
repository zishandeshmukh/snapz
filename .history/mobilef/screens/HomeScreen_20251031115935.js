import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import MemoryCard from '../components/MemoryCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { memories, loading, fetchMemories, toggleFavorite } = useSupabase();

  const recent = useMemo(() => 
    memories.slice(0, 10),
    [memories]
  );

  const favorites = useMemo(() => 
    memories.filter(m => m.favorite).slice(0, 10),
    [memories]
  );

  return (
    
      }
    >
      <LinearGradient
        colors={['#0891b2', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        Your Personal Digital Memory
        
          All your captured moments, organized and searchable
        
        
          
            {memories.length}
            Total Memories
          
          
            {favorites.length}
            Favorites
          
        
      

      
        Recent
        {recent.length === 0 ? (
          No memories yet. Start capturing!
        ) : (
          recent.map(item => (
            
          ))
        )}
      

      {favorites.length > 0 && (
        
          Favorites
          {favorites.map(item => (
            
          ))}
        
      )}
    
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