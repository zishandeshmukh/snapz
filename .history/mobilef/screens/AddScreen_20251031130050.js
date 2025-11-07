import React, { useState } from 'react';

// --- Mock functions for web compatibility ---

// Mock useSupabase hook
const useSupabase = () => ({
  fetchMemories: () => {
    console.log('Mock: Fetching memories...');
    return new Promise((resolve) => setTimeout(resolve, 500));
  },
});

// Mock sendToBackend function
const sendToBackend = (title, url, content) => {
  console.log('Mock: Sending to backend:', { title, url, content });
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

// --- Web-Compatible React Component ---

export default function AddScreen() {
  const { fetchMemories } = useSupabase();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Simple message display instead of Alert.alert
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      showMessage('error', 'Title is required');
      return;
    }

    setLoading(true);

    try {
      await sendToBackend(title, url, content);
      
      showMessage('success', 'Memory saved successfully!');
      
      setTitle('');
      setUrl('');
      setContent('');
      
      if (typeof fetchMemories === 'function') {
        await fetchMemories();
      }
    } catch (error) {
      console.error('Error adding memory:', error);
      showMessage('error', 'Failed to save memory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen w-full bg-zinc-900 text-white p-4 font-sans">
      <div className="w-full max-w-lg mx-auto">
        {/* Message Popup */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-white ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 mb-5">
          <p className="text-zinc-400 text-sm leading-relaxed">
            💡 Tip: Add content manually or use the Share button from any app to save to SnapMind
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-100 mb-2 mt-4">
              Title *
            </label>
            <input
              type="text"
              style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-100 mb-2 mt-4">
              URL (optional)
            </label>
            <input
              type="url"
              style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-100 mb-2 mt-4">
              Content (optional)
            </label>
            <textarea
              style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
              className="w-full p-3 rounded-lg border min-h-[120px] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add notes or content..."
            />
          </div>

          <button
            style={{ 
              backgroundColor: '#06b6d4', 
              opacity: (loading || !title.trim()) ? 0.6 : 1 
            }}
            className="w-full p-4 rounded-lg text-white font-bold text-base text-center mt-6 transition-opacity"
            onClick={handleAdd}
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              'Save Memory'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

