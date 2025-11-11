import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '../context/SupabaseContext';
import { saveDataToBackend } from '../utils/shareUtils';
import { useNavigation } from '@react-navigation/native';

const AddScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const { session, getAuthToken } = useSupabase();
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please add a title and content');
      return;
    }

    if (!session) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    
    try {
      // ✅ Use backend API
      const token = getAuthToken();
      const fullText = `${title}\n\n${content}\n\nTags: ${tags}`;
      await saveDataToBackend(fullText, token);

      Alert.alert('Success', 'Memory saved!');
      setTitle('');
      setContent('');
      setTags('');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* ✅ HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#06b6d4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Memory</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Give it a memorable title..."
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Content *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your thoughts, notes, or paste content..."
          placeholderTextColor="#666"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          numberOfLines={10}
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
          <ActivityIndicator size="large" color="#06b6d4" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Memory</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const sharedText = useShareIntent();
useEffect(() => {
  if (sharedText) {
    setContent(sharedText);
    setTimeout(() => handleSave(), 2000); // auto-save after 2 s
  }
}, [sharedText]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fafafa',
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
    height: 200,
    textAlignVertical: 'top',
  },
  loader: {
    marginTop: 30,
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