import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import { searchDataFromBackend } from '../utils/shareUtils';
import MemoryCard from '../components/MemoryCard';
// import { Icon } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { getAuthToken, supabase } = useSupabase();

  const handleSearch = async () => {
    if (query.trim().length === 0) return;

    setLoading(true);
    setHasSearched(true);
    const token = getAuthToken();

    try {
      // 1. Get IDs from backend
      const ids = await searchDataFromBackend(query, token);

      if (!ids || ids.length === 0) {
        setResults([]);
        return;
      }

      // 2. Get full data for those IDs
      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data);

    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Search your snapz..."
          placeholderTextColor="#777"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
          <Icon name="search" type="ionicon" color="tomato" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MemoryCard memory={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            hasSearched && (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No results found.</Text>
              </View>
            )
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    borderColor: '#333',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    color: '#FFF',
    padding: 15,
    fontSize: 16,
  },
  searchIcon: {
    padding: 10,
  },
  list: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  }
});

export default SearchScreen;