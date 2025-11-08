import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, FlatList, View, Text, StyleSheet } from 'react-native';
import { fetchDocuments, toggleFavorite } from './src/lib/api';
import MemoryListItem from './src/components/MemoryListItem';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const docs = await fetchDocuments();
      setItems(docs);
    } catch (e) {
      console.error('Failed to load documents', e);
    }
    setLoading(false);
  }

  async function onToggleFav(id) {
    try {
      await toggleFavorite(id);
      setItems((prev) => prev.map(it => it.id === id ? { ...it, favorite: !it.favorite } : it));
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>SnapMind — Mobile (Expo)</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => (
          <MemoryListItem item={item} onToggleFav={() => onToggleFav(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1724' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  title: { color: '#f8fafc', fontSize: 20, fontWeight: '700' }
});
