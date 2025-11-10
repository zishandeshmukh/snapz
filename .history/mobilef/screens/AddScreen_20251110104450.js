import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import { saveDataToBackend } from '../utils/shareUtils';
import { useNavigation } from '@react-navigation/native';

const AddScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAuthToken } = useSupabase();
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please add a title and content');
      return;
    }

    setLoading(true);
    const token = getAuthToken();

    try {
      // Create structured data
      const data = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        source: 'M', // Mobile
      };

      await saveDataToBackend(data, token);
      Alert.alert('Success', 'Memory saved!');
      
      // Clear form
      setTitle('');
      setContent('');
      setTags('');
      
      // Go back to Home
      navigation.navigate('Home');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Memory</Text>
        <Text style={styles.subtitle}>Save your thoughts and ideas</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Give it a memorable title..."
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your thoughts, notes, or paste content..."
          placeholderTextColor="#666"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          numberOfLines={8}
        />

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="work, ideas, inspiration..."
          placeholderTextColor="#666"
          value={tags}
          onChangeText={setTags}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#06b6d4" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Memory</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#18181b',
    color: '#fafafa',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#06b6d4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddScreen;