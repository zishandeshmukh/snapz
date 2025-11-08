import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';

// Helper to format the date
const formatDate = (dateString) => {
  if (!dateString) return 'Invalid date';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const MemoryCard = ({ memory }) => {
  const { metadata, created_at, source } = memory;
  const { title, summary, keywords, emotions } = metadata || {};

  // Get the (M) or (W) tag, as requested
  const sourceTag = source === 'M' ? '(M)' : source === 'W' ? '(W)' : '';

  return (
    <Card containerStyle={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title || 'Untitled Snap'}</Text>
        <Text style={styles.date}>{formatDate(created_at)} {sourceTag}</Text>
      </View>
      <Card.Divider color="#333" />
      <Text style={styles.summary}>{summary || 'No summary available.'}</Text>
      
      {keywords && keywords.length > 0 && (
        <View style={styles.tagContainer}>
          <Text style={styles.tagLabel}>Keywords:</Text>
          {keywords.slice(0, 3).map((keyword, index) => (
            <View key={index} style={[styles.tag, styles.keywordTag]}>
              <Text style={styles.tagText}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      {emotions && emotions.length > 0 && (
        <View style={styles.tagContainer}>
          <Text style={styles.tagLabel}>Emotions:</Text>
          {emotions.slice(0, 2).map((emotion, index) => (
            <View key={index} style={[styles.tag, styles.emotionTag]}>
              <Text style={styles.tagText}>{emotion}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    borderWidth: 0,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // Allow title to take space
    marginRight: 5,
  },
  date: {
    color: '#999',
    fontSize: 12,
    flexShrink: 0, // Prevent date from shrinking
  },
  summary: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 5,
  },
  tagLabel: {
    color: '#888',
    fontSize: 12,
    marginRight: 5,
  },
  tag: {
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
    margin: 2,
  },
  keywordTag: {
    backgroundColor: '#3a3a3a',
  },
  emotionTag: {
    backgroundColor: '#004d40', // A teal color
  },
  tagText: {
    color: '#FFF',
    fontSize: 11,
  },
});

export default MemoryCard;