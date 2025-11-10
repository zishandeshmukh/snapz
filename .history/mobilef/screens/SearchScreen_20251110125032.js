import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '../context/SupabaseContext';
import MemoryCard from '../components/MemoryCard';
import { useFocusEffect } from '@react-navigation/native';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { supabase, session, memories } = useSupabase();

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (!session) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      // ✅ Search in metadata fields
      const searchTerm = searchQuery.toLowerCase();
      const filtered = memories.filter(memory => {
        const meta = memory.metadata || {};
        const title = meta.title?.toLowerCase() || '';
        const summary = meta.summary?.toLowerCase() || '';
        const keywords = meta.keywords?.map(k => k.toLowerCase()) || [];
        
        return title.includes(searchTerm) || 
               summary.includes(searchTerm) || 
               keywords.some(k => k.includes(searchTerm));
      });

      setResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert('Error', 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [session, memories]);

  useFocusEffect(
    useCallback(() => {
      // Clear search when screen loses focus
      return () => setQuery('');
    }, [])
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* ✅ HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Memories</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={22} color="#71717a" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, content, or keywords..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => performSearch(query)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MemoryCard memory={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            hasSearched && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#27272a" />
                <Text style={styles.emptyText}>
                  {query ? 'No results found' : 'Enter a search term'}
                </Text>
                <Text style={styles.emptySubtext}>Try searching for keywords, titles, or tags</Text>
              </View>
            )
          }
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fafafa',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default SearchScreen;