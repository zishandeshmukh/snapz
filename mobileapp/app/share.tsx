import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSearchParams } from 'expo-router';

export default function SharePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing shared content...');

  useEffect(() => {
    const handleShare = async () => {
      try {
        const url = searchParams.get('url');
        const title = searchParams.get('title');
        const text = searchParams.get('text');

        if (!url) {
          setStatus('error');
          setMessage('No URL provided');
          return;
        }

        const formData = new FormData();
        if (url) formData.append('url', url);
        if (title) formData.append('title', title);
        if (text) formData.append('text', text);

        const response = await fetch('/share', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to process share');
        }

        setStatus('success');
        setMessage('Content saved successfully!');

        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    handleShare();
  }, [searchParams]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.message}>{message}</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text style={styles.emoji}>✓</Text>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.subtext}>Redirecting to home...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={styles.emoji}>✕</Text>
            <Text style={[styles.message, styles.errorText]}>{message}</Text>
            <Text style={styles.subtext}>Please try again</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 'auto',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 48,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    color: '#d32f2f',
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
