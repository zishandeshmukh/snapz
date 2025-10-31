import { Alert } from 'react-native';
import { BACKEND_URL } from './constants';

export const handleIncomingShare = async (url) => {
  try {
    if (url) {
      console.log('Received shared URL:', url);
      Alert.alert('Share Received', 'Opening SnapMind to save this content...');
    }
  } catch (error) {
    console.error('Error handling incoming share:', error);
  }
};

export const sendToBackend = async (title, url, content) => {
  try {
    const textForAI = `Title: ${title}\nURL: ${url}\n\n${content}`;
    
    const response = await fetch(`${BACKEND_URL}/receive_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: textForAI,
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending to backend:', error);
    throw error;
  }
};

export const deriveType = (url) => {
  if (!url) return 'text';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('x.com') || url.includes('twitter.com')) return 'twitter';
  if (url.includes('reddit.com')) return 'reddit';
  if (url.includes('instagram.com')) return 'instagram';
  return 'article';
};

