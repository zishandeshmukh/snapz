import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import { sendToBackend } from '../utils/shareUtils';

export default function AddScreen() {
  const { fetchMemories } = useSupabase();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setLoading(true);

    try {
      await sendToBackend(title, url, content);
      
      Alert.alert('Success', 'Memory saved successfully!');
      
      setTitle('');
      setUrl('');
      setContent('');
      
      await fetchMemories();
    } catch (error) {
      console.error('Error adding memory:', error);
      Alert.alert('Error', 'Failed to save memory. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
      
        
          
            💡 Tip: Add content manually or use the Share button from any app to save to SnapMind
          
        

        Title *
        

        URL (optional)
        

        Content (optional)
        

        
          {loading ? (
            
          ) : (
            Save Memory
          )}
        
      
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  form: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  infoText: {
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    color: '#fafafa',
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
  },
  addBtn: {
    backgroundColor: '#06b6d4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  addBtnDisabled: {
    opacity: 0.6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});