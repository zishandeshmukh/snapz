import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

export default function MemoryListItem({ item, onToggleFav }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title || 'Untitled'}</Text>
        <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        <Text style={styles.meta}>{item.timestamp ? dayjs(item.timestamp).format('YYYY-MM-DD HH:mm') : ''}</Text>
      </View>
      <TouchableOpacity onPress={onToggleFav} style={styles.favBtn}>
        <Text style={{ color: '#fff' }}>{item.favorite ? '★' : '☆'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937', alignItems: 'center' },
  title: { color: '#e6eef6', fontWeight: '700', marginBottom: 4 },
  summary: { color: '#9ca3af', marginBottom: 6 },
  meta: { color: '#6b7280', fontSize: 12 },
  favBtn: { marginLeft: 12, padding: 8, backgroundColor: '#0ea5a9', borderRadius: 6 }
});
