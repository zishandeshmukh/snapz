import React, { useState } from 'react';

// --- Mocks for Web Preview ---
// Mock Supabase context
const useSupabase = () => ({
  fetchMemories: () => {
    console.log('Mock fetchMemories called');
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
});

// Mock backend utility
const sendToBackend = (title, url, content) => {
  console.log('Mock sendToBackend called with:', { title, url, content });
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

// Mock Alert
const Alert = {
  alert: (title, message) => {
    console.log(`[Alert] ${title}: ${message}`);
    // In a real web app, you'd use a modal here, not window.alert.
  }
};
// --- End Mocks ---

export default function AddScreen() {
  const { fetchMemories } = useSupabase();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setLoading(true);

    try {
      await sendToBackend(title, url, content);
      
      Alert.alert('Success', 'Memory saved successfully!');
      
      setTitle('');
      setUrl('');
      setContent('');
      
      await fetchMemories();
    } catch (error) {
      console.error('Error adding memory:', error);
      Alert.alert('Error', 'Failed to save memory. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || !title.trim();

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleAdd}>
        
        <div style={styles.infoCard}>
          <span style={styles.infoText}>
            💡 Tip: Add content manually or use the Share button from any app to save to SnapMind
          </span>
        </div>

        <label style={styles.label} htmlFor="title-input">Title *</label>
        <input
          id="title-input"
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
        />

        <label style={styles.label} htmlFor="url-input">URL (optional)</label>
        <input
          id="url-input"
          style={styles.input}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          type="url"
        />

        <label style={styles.label} htmlFor="content-input">Content (optional)</label>
        <textarea
          id="content-input"
          style={{...styles.input, ...styles.textArea}}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add notes or content..."
        />

        <button
          style={{...styles.addBtn, ...(isButtonDisabled && styles.addBtnDisabled)}}
          type="submit"
          disabled={isButtonDisabled}
        >
          {loading ? (
            <div style={styles.spinner}></div>
          ) : (
            'Save Memory'
          )}
        </button>
      </form>
    </div>
  );
}

// Basic CSS-in-JS to mimic React Native styles for web preview
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    color: '#fafafa',
    fontFamily: 'sans-serif',
    padding: 16,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoCard: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    border: '1px solid #27272a',
  },
  infoText: {
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 1.5,
  },
  label: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 8,
    padding: 12,
    color: '#fafafa',
    fontSize: 14,
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
    width: '100%',
  },
  textArea: {
    minHeight: 120,
    resize: 'vertical',
  },
  addBtn: {
    backgroundColor: '#06b6d4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    height: 50,
  },
  addBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinner: {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    width: 18,
    height: 18,
    animation: 'spin 1s linear infinite',
  },
  // Keyframes for spinner (would need to be injected globally)
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  }
};

// Inject keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

