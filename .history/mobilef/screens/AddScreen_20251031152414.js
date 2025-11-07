import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
// We won't use sendToBackend directly here if we're mocking
// import { sendToBackend } from '../utils/shareUtils'; 
import { useRoute, useIsFocused } from '@react-navigation/native';

// This is the mock function from your working context file
const mockSendToBackend = async (title, url, content) => {
  console.log('Mock sendToBackend:', { title, url, content });
  return new Promise(res => setTimeout(() => res({ success: true }), 500));
};

export default function AddScreen() {
  const { fetchMemories } = useSupabase();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const route = useRoute(); // Hook to get route params
  const isFocused = useIsFocused(); // Hook to check if screen is focused

  useEffect(() => {
    // Check if we received a sharedUrl param when the screen was focused
    if (isFocused && route.params?.sharedUrl) {
      const { sharedUrl } = route.params;
      console.log('AddScreen received URL:', sharedUrl);
      setUrl(sharedUrl); // Set the URL state
      
      // We can also try to pre-fill the title
      if (!title) {
        // Try to generate a title from the URL
        try {
          const urlObj = new URL(sharedUrl);
          const simpleTitle = urlObj.hostname.replace('www.', '') + urlObj.pathname.substring(0, 30);
          setTitle(simpleTitle);
        } catch (e) {
          setTitle(sharedUrl.substring(0, 50)); // Fallback for non-URLs
        }
      }
      
      // IMPORTANT: Clear the param so it doesn't get used again
      // We need to find the navigation object to do this...
      // For now, we'll just rely on isFocused
    }
  }, [isFocused, route.params?.sharedUrl]); // Re-run when screen is focused or params change

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    setLoading(true);
    Keyboard.dismiss();

    try {
      // Using the mock function for now
      await mockSendToBackend(title, url, content);
      
      Alert.alert('Success', 'Memory saved successfully!');
      
      setTitle('');
      setUrl('');
      setContent('');
      
      if (typeof fetchMemories === 'function') {
        await fetchMemories();
      }
    } catch (error) {
      console.error('Error adding memory:', error);
      Alert.alert('Error', 'Failed to save memory. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Tip: Add content manually or use the Share button from any app to save to SnapMind
          </Text>
        </View>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          placeholderTextColor="#52525b"
        />

        <Text style={styles.label}>URL (optional)</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com"
          placeholderTextColor="#52525b"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>Content (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Add notes or content..."
          placeholderTextColor="#52525b"
          multiline={true}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.addBtn, (loading || !title.trim()) && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={loading || !title.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>Save Memory</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingTop: 12,
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

