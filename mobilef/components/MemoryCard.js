import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const TYPE_ICONS = {
  youtube: { name: 'logo-youtube', color: '#ef4444' },
  linkedin: { name: 'logo-linkedin', color: '#0077b5' },
  twitter: { name: 'logo-twitter', color: '#1da1f2' },
  reddit: { name: 'logo-reddit', color: '#ff4500' },
  instagram: { name: 'logo-instagram', color: '#e4405f' },
  article: { name: 'document-text', color: '#06b6d4' },
  text: { name: 'document', color: '#71717a' },
};

export default function MemoryCard({ item, onToggleFav }) {
  const [expanded, setExpanded] = useState(false);

  // Default item to prevent crashes if item is undefined
  const validItem = item || {};
  const {
    id,
    type,
    emotion,
    title,
    summary,
    keywords,
    timestamp,
    url,
    favorite
  } = validItem;

  const icon = TYPE_ICONS[type] || TYPE_ICONS.article;

  const handleOpenUrl = () => {
    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) Linking.openURL(url);
        else Alert.alert('Error', `Cannot open this URL: ${url}`);
      });
    }
  };

  const handleShare = async () => {
    try {
      const message = `${title}\n\n${summary || ''}\n\n${url || ''}`;
      await Share.share({
        message: message,
        title: title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(url || title || '');
      Alert.alert('Copied', 'Content copied to clipboard');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return 'Invalid date';
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onFavPress = () => {
    if (typeof onToggleFav === 'function') {
      onToggleFav(id);
    }
  };

  // The error was here: All text, including the '•',
  // must be inside a <Text> component.
  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Ionicons name={icon.name} size={18} color={icon.color} />
          {emotion && (
            <Text style={styles.emotion}>• {emotion}</Text>
          )}
        </View>
        <TouchableOpacity onPress={onFavPress} style={styles.actionBtn}>
          <Ionicons
            name={favorite ? 'star' : 'star-outline'}
            size={20}
            color={favorite ? '#f59e0b' : '#71717a'}
          />
        </TouchableOpacity>
      </View>

      {/* Card Body */}
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>

      {summary && (
        <Text style={styles.summary}>{summary}</Text>
      )}

      {keywords && keywords.length > 0 && (
        <View style={styles.keywords}>
          {keywords.slice(0, expanded ? keywords.length : 4).map((keyword, idx) => (
            <View style={styles.keyword} key={`${keyword}-${idx}`}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Card Footer */}
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(timestamp)}</Text>
        <View style={styles.actions}>
          {url && (
            <TouchableOpacity onPress={handleOpenUrl} style={styles.actionBtn}>
              <Ionicons name="open-outline" size={18} color="#a1a1aa" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleCopy} style={styles.actionBtn}>
            <Ionicons name="copy-outline" size={18} color="#a1a1aa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={18} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotion: {
    fontSize: 12,
    color: '#71717a',
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
    marginBottom: 12,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  keyword: {
    backgroundColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 11,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  date: {
    fontSize: 11,
    color: '#71717a',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
});

