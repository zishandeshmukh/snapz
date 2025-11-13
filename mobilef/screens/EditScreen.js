import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '../context/SupabaseContext';
import { BACKEND_API_URL } from '../utils/constants';

const EditScreen = ({ route, navigation }) => {
    const { memory } = route.params;
    const { getAuthToken } = useSupabase();
    const [title, setTitle] = useState(memory.metadata.title);
    const [summary, setSummary] = useState(memory.metadata.summary);
    const [keywords, setKeywords] = useState((memory.metadata.keywords || []).join(', '));
    const [mood, setMood] = useState(memory.metadata.mood);
    const moods = [
        { label: 'Happy', value: 'happy', icon: 'happy-outline' },
        { label: 'Sad', value: 'sad', icon: 'sad-outline' },
        { label: 'Excited', value: 'excited', icon: 'star-outline' },
        { label: 'Calm', value: 'calm', icon: 'leaf-outline' },
        { label: 'Productive', value: 'productive', icon: 'flash-outline' },
    ];
    const handleSave = async () => {
        const token = getAuthToken();
        if (!token) {
            Alert.alert('Error', 'You must be logged in to edit memories.');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_API_URL}/memories/${memory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    metadata: {
                        ...memory.metadata,
                        title,
                        summary,
                        keywords: keywords.split(',').map(k => k.trim()),
                        mood,
                    },
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to update memory');
            }

            Alert.alert('Success', 'Memory updated');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
            />
            <Text style={styles.label}>Summary</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={summary}
                onChangeText={setSummary}
                multiline
            />
            <Text style={styles.label}>Keywords (comma-separated)</Text>
            <TextInput
                style={styles.input}
                value={keywords}
                onChangeText={setKeywords}
            />
            <Text style={styles.label}>Mood</Text>
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
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#09090b',
    },
    label: {
        fontSize: 16,
        color: '#a1a1aa',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#18181b',
        color: '#fafafa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#06b6d4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
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

export default EditScreen;
