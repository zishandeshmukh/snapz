import { BACKEND_API_URL } from './constants';
import { Alert } from 'react-native';

// ✅ Save data to backend
export const saveDataToBackend = async (text, token) => {
  if (!token) {
    throw new Error("You must be logged in to save.");
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/receive_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        rawText: text,
        source: 'M'
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send data');
    }

    return await response.json();
  } catch (error) {
    console.error('Backend error:', error);
    // Fallback: Save directly to Supabase if backend fails
    throw new Error('Backend unavailable. Check server connection.');
  }
};

// ✅ Search via backend
export const searchDataFromBackend = async (query, token) => {
  if (!token) {
    throw new Error("You must be logged in to search.");
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/searchNLPSql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Search failed');
    }

    const { ids } = await response.json();
    return ids || [];
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};