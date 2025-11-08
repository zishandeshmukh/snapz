// Supabase client
const supabaseClient = window.supabase?.createClient ?
  window.supabase.createClient('https://your-project.supabase.co', 'YOUR_ANON_KEY') :
  null;

// Backend URL
const BACKEND_URL = 'https://your-backend.onrender.com';

// Elements
const saveBtn = document.getElementById('saveBtn');
const logoutBtn = document.getElementById('logoutBtn');
const statusEl = document.getElementById('status');
const snapsListEl = document.getElementById('snapsList');

// Check auth on load
chrome.storage.local.get(['session'], (result) => {
  if (!result.session) {
    window.location.href = 'auth.html';
    return;
  }
  
  // Set auth for Supabase
  supabaseClient.auth.setSession(result.session);
  
  // Load recent snaps
  loadRecentSnaps();
  
  // Set up save button
  saveBtn.onclick = saveCurrentPage;
});

// Save current page
async function saveCurrentPage() {
  saveBtn.disabled = true;
  showStatus('loading', 'Analyzing page...');
  
  try {
    // Get page content from content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Extract readable text from page
        const selection = window.getSelection().toString();
        if (selection) return selection;
        
        // Fallback: get article content or meta description
        const article = document.querySelector('article')?.innerText;
        if (article) return article.substring(0, 2000);
        
        const meta = document.querySelector('meta[name="description"]')?.content;
        const title = document.title;
        const text = document.body.innerText;
        
        return `${title}\n\n${meta || ''}\n\n${text.substring(0, 1500)}`;
      }
    });

    if (!result || result.length < 50) {
      throw new Error('Not enough content to analyze');
    }
    
    // Send to backend
    const response = await fetch(`${BACKEND_URL}/receive_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabaseClient.auth.getSession()).data.session.access_token}`
      },
      body: JSON.stringify({
        rawText: result,
        source: 'W'
      })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Failed to save');
    
    showStatus('success', 'Saved successfully!');
    loadRecentSnaps();
    
  } catch (error) {
    showStatus('error', error.message);
  } finally {
    saveBtn.disabled = false;
    setTimeout(() => statusEl.classList.add('hidden'), 3000);
  }
}

// Load recent snaps
async function loadRecentSnaps() {
  try {
    const { data: snaps, error } = await supabaseClient
      .from('content_documents')
      .select('id, metadata->title, created_at')
      .eq('source', 'W')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    
    if (!snaps || snaps.length === 0) {
      snapsListEl.innerHTML = '<div class="empty-state">No page snaps yet</div>';
      return;
    }
    
    snapsListEl.innerHTML = snaps.map(snap => `
      <div class="snap-card">
        <div class="snap-title">${snap.title || 'Untitled'}</div>
        <div class="snap-meta">${new Date(snap.created_at).toLocaleDateString()}</div>
      </div>
    `).join('');
    
  } catch (error) {
    snapsListEl.innerHTML = `<div class="error">Failed to load: ${error.message}</div>`;
  }
}

// Show status
function showStatus(type, message) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
  statusEl.classList.remove('hidden');
}

// Logout
logoutBtn.onclick = async () => {
  await supabaseClient.auth.signOut();
  chrome.storage.local.remove(['session', 'userId']);
  window.location.href = 'auth.html';
};