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
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import { sendToBackend } from '../utils/shareUtils';
// --- 1. IMPORT NAVIGATION HOOKS ---
import { useRoute, useIsFocused, useNavigation } from '@react-navigation/native';

export default function AddScreen() {
  const { fetchMemories } = useSupabase() || { fetchMemories: () => {} };
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 2. GET NAVIGATION PROPS ---
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Check if the screen is focused

  // --- 3. ADD EFFECT TO LISTEN FOR SHARED URL ---
  useEffect(() => {
    // Check if the screen is focused AND there's a sharedUrl param
    if (isFocused && route.params?.sharedUrl) {
      const { sharedUrl } = route.params;
      
      // Set the URL in the state
      setUrl(sharedUrl);
      
      // Clear the param so it doesn't run again if you re-focus the tab
      navigation.setParams({ sharedUrl: null });
    }
  }, [isFocused, route.params, navigation]); // Re-run when these change

  const handleAdd = async () => {
    // Updated logic: Only require a title OR a URL
    if (!title.trim() && !url.trim()) { 
      Alert.alert('Error', 'Title or URL is required');
      return;
    }

    setLoading(true);

    try {
      // Use the URL as the title if the title is empty
      const memoryTitle = title.trim() || url;
      
      await sendToBackend(memoryTitle, url, content);
      
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
        
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Tip: Add content manually or use the Share button from any app to save to SnapMind
          </Text>
        </View>

        {/* Title Input */}
        <Text style={styles.label}>Title (optional)</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title (or leave blank to use URL)"
          placeholderTextColor="#52525b"
        />

        {/* URL Input */}
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

        {/* Content Input */}
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

        {/* Save Button */}
        <TouchableOpacity
          // Update disabled logic to match the handleAdd check
          style={[styles.addBtn, (loading || (!title.trim() && !url.trim())) && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={loading || (!title.trim() && !url.trim())}
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
    color:  '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

