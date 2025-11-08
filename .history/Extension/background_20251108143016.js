// Service worker for extension lifecycle management
console.log('SnapMind background service worker started');

// Keep extension alive
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// Handle authentication state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.session) {
    if (!changes.session.newValue) {
      // Session cleared - redirect to auth
      chrome.action.setPopup({ popup: 'auth.html' });
    } else {
      chrome.action.setPopup({ popup: 'popup.html' });
    }
  }
});

// Set initial popup based on auth state
chrome.storage.local.get(['session'], (result) => {
  chrome.action.setPopup({ 
    popup: result.session ? 'popup.html' : 'auth.html' 
  });
});