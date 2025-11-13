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
import { useShareIntent } from 'expo-share-intent';

const AddScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const { session, getAuthToken } = useSupabase();
  const navigation = useNavigation();
  const moods = [
    { label: 'Happy', value: 'happy', icon: 'happy-outline' },
    { label: 'Sad', value: 'sad', icon: 'sad-outline' },
    { label: 'Excited', value: 'excited', icon: 'star-outline' },
    { label: 'Calm', value: 'calm', icon: 'leaf-outline' },
    { label: 'Productive', value: 'productive', icon: 'flash-outline' },
  ];
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
      const fullText = `${title}\n\n${content}`;
      const keywords = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await saveDataToBackend(fullText, token, { keywords, mood });

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

        <Text style={styles.label}>How are you feeling?</Text>
        <View style={styles.moodContainer}>
          {moods.map(m => (
            <TouchableOpacity
              key={m.value}
              style={[styles.moodButton, mood === m.value ? styles.moodSelected : {}]}
              onPress={() => setMood(m.value)}
            >
              <Ionicons
                name={m.icon}
                size={24}
                color={mood === m.value ? '#fff' : '#a1a1aa'}
              />
              <Text style={styles.moodLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#18181b',
    width: '30%',
    marginBottom: 10,
  },
  moodSelected: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  moodLabel: {
    color: '#a1a1aa',
    marginTop: 5,
    fontSize: 12,
  },
});

export default AddScreen;