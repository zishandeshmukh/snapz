import React from 'react';
import { TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShareButton({ item }) {
  const handleShare = async () => {
    try {
      const message = `${item.title}\n\n${item.summary || ''}\n\n${item.url || ''}`;
      const result = await Share.share({
        message: message,
        title: item.title,
        url: item.url,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share content');
      console.error('Share error:', error);
    }
  };

  return (
    
      
    
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});