import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import MemoryCard from '../components/MemoryCard';
import { Ionicons } from '@expo/vector-icons';
import { EMOTIONS } from '../utils/constants';

export default function SearchScreen() {
  const { memories = [], toggleFavorite } = useSupabase() || {};
  const [searchMode, setSearchMode] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const filteredMemories = useMemo(() => {
    if (searchMode === 'text' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return memories.filter(m => {
        const searchable = [
          m.title,
          m.summary,
          ...(m.keywords || [])
        ].join(' ').toLowerCase();
        return searchable.includes(query);
      });
    }

    if (searchMode === 'emotion' && selectedEmotion) {
      return memories.filter(m => 
        m.emotion?.toLowerCase() === selectedEmotion.toLowerCase()
      );
    }

    return memories;
  }, [memories, searchMode, searchQuery, selectedEmotion]);

  // FIX: Your log showed a syntax error here,
  // but the file you uploaded looks correct.
  // This version is based on your uploaded file which
  // should already be working.
  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeBtn, searchMode === 'text' && styles.modeBtnActive]}
            onPress={() => {
              setSearchMode('text');
              setSelectedEmotion(null);
            }}
          >
            <Text style={[styles.modeBtnText, searchMode === 'text' && styles.modeBtnTextActive]}>
              Text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, searchMode === 'emotion' && styles.modeBtnActive]}
            onPress={() => {
              setSearchMode('emotion');
              setSearchQuery('');
            }}
          >
            <Text style={[styles.modeBtnText, searchMode === 'emotion' && styles.modeBtnTextActive]}>
              Emotion
            </Text>
          </TouchableOpacity>
        </View>

        {searchMode === 'text' && (
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#71717a" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search memories..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {searchMode === 'emotion' && (
          <View style={styles.emotionContainer}>
            {(EMOTIONS || []).map(emotion => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionBtn,
                  selectedEmotion === emotion && styles.emotionBtnActive
                ]}
                onPress={() => setSelectedEmotion(emotion === selectedEmotion ? null : emotion)}
              >
                <Text style={[
                  styles.emotionBtnText,
                  selectedEmotion === emotion && styles.emotionBtnTextActive
                ]}>
                  {emotion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.results}>
        <Text style={styles.resultCount}>
          {filteredMemories.length} {filteredMemories.length === 1 ? 'result' : 'results'}
        </Text>
        {filteredMemories.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery || selectedEmotion ? 'No results found' : 'Start searching...'}
          </Text>
        ) : (
          filteredMemories.map(item => (
            <MemoryCard 
              key={item.id} 
              item={item} 
              onToggleFav={toggleFavorite}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  searchHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeBtnActive: {
    backgroundColor: '#27272a',
  },
  modeBtnText: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#06b6d4',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#fafafa',
    fontSize: 14,
  },
  emotionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  emotionBtnActive: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  emotionBtnText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
  },
  emotionBtnTextActive: {
    color: '#fff',
  },
  results: {
    flex: 1,
    padding: 16,
  },
  resultCount: {
    color: '#71717a',
    fontSize: 12,
    marginBottom: 12,
  },
  emptyText: {
    color: '#71717a',
    textAlign: 'center',
    paddingVertical: 40,
  },
});
