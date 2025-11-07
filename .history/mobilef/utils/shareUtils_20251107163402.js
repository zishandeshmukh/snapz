import { BACKEND_API_URL } from './constants';

/**
 * Saves new text data to the backend.
 * This is called from the AddScreen.
 */
export const saveDataToBackend = async (text, token) => {
  if (!token) {
    console.error("No auth token provided");
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
        source: 'M' // Source is 'M' for Mobile
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to send data');
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error sending data to backend:', error);
    throw error;
  }
};

/**
 * Searches the user's data via the backend
 * This is called from HomeScreen and SearchScreen.
 */
export const searchDataFromBackend = async (query, token) => {
  if (!token) {
    console.error("No auth token provided");
    throw new Error("You must be logged in to search.");
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/searchNLPSql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: query })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to search data');
    }

    const { ids } = await response.json();
    return ids; // Returns an array of IDs
    
  } catch (error) {
    console.error('Error searching data from backend:', error);
    throw error;
  }
};