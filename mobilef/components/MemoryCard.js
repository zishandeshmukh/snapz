import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Share 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Helper to format date
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

const MemoryCard = ({ memory, onToggleFavorite, onDelete }) => {
  const navigation = useNavigation();
  const { metadata, created_at, source, id } = memory;
  const { title, summary, keywords, emotions, favorite, mood } = metadata || {};
  const moodIcons = {
    happy: 'happy-outline',
    sad: 'sad-outline',
    excited: 'star-outline',
    calm: 'leaf-outline',
    productive: 'flash-outline',
  };
  const sourceTag = source === 'M' ? '(M)' : source === 'W' ? '(W)' : '';

  // ✅ Share functionality
  const handleShare = async () => {
    try {
      const shareText = `${title || 'Memory from SnapMind'}\n\n${summary || ''}\n\nTags: ${keywords?.join(', ') || ''}`;
      await Share.share({
        message: shareText,
        title: title || 'SnapMind Memory',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={[styles.card, styles.cardContainer]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title || 'Untitled Snap'}</Text>
          <Text style={styles.date}>{formatDate(created_at)} {sourceTag}</Text>
        </View>
        
        <View style={styles.iconContainer}>
          {mood && (
            <Ionicons
              name={moodIcons[mood] || 'help-circle-outline'}
              size={22}
              color="#a1a1aa"
              style={styles.icon}
            />
          )}
          {/* ✅ Favorite Button */}
          <TouchableOpacity onPress={() => onToggleFavorite?.(id)}>
            <Ionicons 
              name={favorite ? 'heart' : 'heart-outline'} 
              size={24} 
              color={favorite ? '#ef4444' : '#a1a1aa'} 
              style={styles.icon}
            />
          </TouchableOpacity>
          
          {/* ✅ Share Button */}
          <TouchableOpacity onPress={handleShare}>
            <Ionicons 
              name="share-outline" 
              size={22} 
              color="#06b6d4" 
              style={styles.icon}
            />
          </TouchableOpacity>
          
          {/* ✅ Edit Button */}
          <TouchableOpacity onPress={() => navigation.navigate('Edit', { memory })}>
            <Ionicons
              name="create-outline"
              size={22}
              color="#a1a1aa"
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* ✅ Delete Button */}
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(id)}>
              <Ionicons 
                name="trash-outline" 
                size={22} 
                color="#ef4444" 
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.divider} />
      <Text style={styles.summary}>{summary || 'No summary available.'}</Text>
      
      {/* ✅ Keywords with icon */}
      {keywords && keywords.length > 0 && (
        <View style={styles.tagContainer}>
          <Ionicons name="pricetag-outline" size={14} color="#888" style={styles.tagIcon} />
          {keywords.slice(0, 3).map((keyword, index) => (
            <View key={`kw-${index}`} style={[styles.tag, styles.keywordTag]}>
              <Text style={styles.tagText}>{keyword}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ✅ Emotions with icon */}
      {emotions && emotions.length > 0 && (
        <View style={styles.tagContainer}>
          <Ionicons name="happy-outline" size={14} color="#888" style={styles.tagIcon} />
          {emotions.slice(0, 2).map((emotion, index) => (
            <View key={`emo-${index}`} style={[styles.tag, styles.emotionTag]}>
              <Text style={styles.tagText}>{emotion}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardContainer: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272a',
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#fafafa',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 12,
    padding: 4,
  },
  summary: {
    color: '#e4e4e7',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagIcon: {
    marginRight: 6,
  },
  tag: {
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  keywordTag: {
    backgroundColor: '#27272a',
  },
  emotionTag: {
    backgroundColor: '#065f46',
  },
  tagText: {
    color: '#e4e4e7',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default MemoryCard;