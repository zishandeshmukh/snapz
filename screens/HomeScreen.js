import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import { searchDataFromBackend } from '../utils/shareUtils';
import MemoryCard from '../components/MemoryCard';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getAuthToken, supabase } = useSupabase();

  const fetchMemories = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 1. Get *only* the IDs from your secure backend
      const ids = await searchDataFromBackend("all data", token);

      if (!ids || ids.length === 0) {
        setMemories([]);
        return;
      }

      // 2. Get the full data for those IDs from Supabase
      // RLS (Row Level Security) in your DB provides a second layer of safety
      const { data, error } = await supabase
        .from('content_documents')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data);

    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect refreshes data every time the screen is viewed
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMemories();
    }, [getAuthToken])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMemories();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Snapz</Text>
      {memories.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No snapz found.</Text>
          <Text style={styles.emptyText}>Pull down to refresh.</Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MemoryCard memory={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFF"
            />
          }
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 20,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 15,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  }
});

export default HomeScreen;