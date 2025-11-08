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
  const icon = TYPE_ICONS[item.type] || TYPE_ICONS.article;

  const handleOpenUrl = () => {
    if (item.url) {
      Linking.openURL(item.url);
    }
  };

  const handleShare = async () => {
    try {
      const message = `${item.title}\n\n${item.summary}\n\n${item.url || ''}`;
      await Share.share({
        message: message,
        title: item.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(item.url || item.title);
      Alert.alert('Copied', 'Content copied to clipboard');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    
      
        
          
          {item.emotion && (
            • {item.emotion}
          )}
        
        <TouchableOpacity onPress={() => onToggleFav(item.id)}>
          
        
      

      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        
          {item.title}
        
      

      {item.summary && (
        
          {item.summary}
        
      )}

      {item.keywords && item.keywords.length > 0 && (
        
          {item.keywords.slice(0, expanded ? item.keywords.length : 4).map((keyword, idx) => (
            
              {keyword}
            
          ))}
        
      )}

      
        {formatDate(item.timestamp)}
        
          {item.url && (
            
              
            
          )}
          
            
          
          
            
          
        
      
    
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