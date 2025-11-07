import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSupabase } from '../context/SupabaseContext';
import { saveDataToBackend } from '../utils/shareUtils';
import { useNavigation } from '@react-navigation/native';

const AddScreen = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAuthToken } = useSupabase();
  const navigation = useNavigation();

  const handleSave = async () => {
    if (text.trim().length < 10) {
      Alert.alert('Too short', 'Please enter a bit more text to save.');
      return;
    }

    setLoading(true);
    const token = getAuthToken();

    try {
      // Send to the new backend
      await saveDataToBackend(text, token);
      
      Alert.alert('Success', 'Snapz saved!');
      setText('');
      // Navigate to Home to see the new snap
      navigation.navigate('Home');

    } catch (error) {
      console.error('Failed to save snap:', error);
      Alert.alert('Error', error.message || 'Could not save your snap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add a Snap</Text>
      <Text style={styles.label}>Paste your text or type a note:</Text>
      <TextInput
        style={styles.input}
        placeholder="Your text here..."
        placeholderTextColor="#777"
        multiline
        numberOfLines={10}
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Save to Snapz</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    height: 200,
    textAlignVertical: 'top',
    borderColor: '#333',
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddScreen;