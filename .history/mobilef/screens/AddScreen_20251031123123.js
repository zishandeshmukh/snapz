import React, { useState } from 'react';
// Removed 'react-native' imports as they are not supported in this web environment.
// Using standard web elements (div, p, input, etc.) instead.

// --- Mock Functions ---
// Creating mock versions of the missing imports to make the component runnable.
// In a real app, you would import these from your actual context and utils files.

const useSupabase = () => {
  // Mock implementation
  const fetchMemories = async () => {
    console.log('Mock fetchMemories called');
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  };
  return { fetchMemories };
};

const sendToBackend = async (title, url, content) => {
  // Mock implementation
  console.log('Mock sendToBackend called with:', { title, url, content });
  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // To test error case:
  // throw new Error('Mock network error');
};
// --- End Mock Functions ---


export default function AddScreen() {
  const { fetchMemories } = useSupabase();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!title.trim()) {
      // Using a simple browser alert.
      // In a real app, you'd use a toast or modal.
      alert('Error: Title is required');
      return;
    }

    setLoading(true);

    try {
      await sendToBackend(title, url, content);
      
      alert('Success: Memory saved successfully!');
      
      setTitle('');
      setUrl('');
      setContent('');
      
      if (typeof fetchMemories === 'function') {
        await fetchMemories();
      }
    } catch (error) {
      console.error('Error adding memory:', error);
      alert('Error: Failed to save memory. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Converted React Native <View> and <Text> to web-standard <div>, <p>, etc.
  // Converted StyleSheet to Tailwind CSS classes to approximate the original design.
  return (
    <div className="flex-1 bg-zinc-900 min-h-screen p-4 font-sans">
      <form onSubmit={handleAdd} className="max-w-xl mx-auto">
        
        {/* Info Card */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 mb-5">
          <p className="text-zinc-400 text-sm leading-normal">
            💡 Tip: Add content manually or use the Share button from any app to save to SnapMind
          </p>
        </div>

        {/* Title Input */}
        <label className="text-zinc-50 font-semibold mb-2 mt-4 block" htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          type="text"
          className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-50 text-sm w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
        />

        {/* URL Input */}
        <label className="text-zinc-50 font-semibold mb-2 mt-4 block" htmlFor="url">
          URL (optional)
        </label>
        <input
          id="url"
          type="url"
          className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-50 text-sm w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />

        {/* Content Input */}
        <label className="text-zinc-50 font-semibold mb-2 mt-4 block" htmlFor="content">
          Content (optional)
        </label>
        <textarea
          id="content"
          className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-50 text-sm w-full min-h-[120px] align-top"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add notes or content..."
        />

        {/* Save Button */}
        <button
          type="submit"
          className={`bg-cyan-500 text-white font-bold py-4 px-4 rounded-lg text-center w-full mt-6 transition-colors ${
            (loading || !title.trim()) 
              ? 'opacity-60 cursor-not-allowed' 
              : 'hover:bg-cyan-600'
          }`}
          disabled={loading || !title.trim()}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              {/* Simple spinner */}
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          ) : (
            'Save Memory'
          )}
        </button>
      </form>
    </div>
  );
}

// The original StyleSheet object is no longer needed as styles are applied via Tailwind.

