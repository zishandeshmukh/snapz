// SnapMind Popup Controller - Advanced Scraping Integration

// Supabase client setup
const supabaseClient = window.supabase?.createClient ?
  window.supabase.createClient(
    'https://your-project.supabase.co',
    'YOUR_ANON_KEY'
  ) : null;

// Backend URL
const BACKEND_URL = 'https://your-backend.onrender.com';

// State management
let currentSession = null;
let currentUserId = null;

// DOM Elements
const elements = {
  saveBtn: document.getElementById('saveBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  statusEl: document.getElementById('status'),
  snapsListEl: document.getElementById('snapsList'),
  recentSnapsEl: document.querySelector('.recent-snaps'),
  content: document.querySelector('.content')
};

// --- Initialize on load ---
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const storage = await chrome.storage.local.get(['session', 'userId']);
  
  if (!storage.session) {
    window.location.href = 'auth.html';
    return;
  }

  currentSession = storage.session;
  currentUserId = storage.userId;
  
  // Set Supabase auth
  await supabaseClient.auth.setSession(currentSession);

  // Set up event listeners
  elements.saveBtn.onclick = saveCurrentPage;
  elements.logoutBtn.onclick = handleLogout;

  // Load recent snaps
  await loadRecentSnaps();

  // Check if we have selected text
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const hasSelection = await checkForSelection(tab);
  
  if (hasSelection) {
    elements.saveBtn.textContent = 'Save Selected Text';
  } else {
    elements.saveBtn.textContent = 'Save This Page';
  }
});

// --- Check for selected text ---
async function checkForSelection(tab) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().length > 50
    });
    return result;
  } catch {
    return false;
  }
}

// --- Save Current Page ---
async function saveCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Disable button and show loading
  elements.saveBtn.disabled = true;
  showStatus('loading', 'Analyzing page content...');

  try {
    // Get advanced scraped data from content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to extract content');
    }

    const metadata = response.metadata;
    
    // Prepare text for backend
    const rawText = `Source URL: ${metadata.url}\n\nContent Type: ${metadata.type}\n\n${metadata.textContent}`
      .substring(0, 2000); // Stay within limits

    // Send to backend
    const backendResponse = await fetch(`${BACKEND_URL}/receive_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentSession.access_token}`
      },
      body: JSON.stringify({
        rawText: rawText,
        source: 'W'
      })
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      throw new Error(data.error || 'Backend processing failed');
    }

    // Success
    showStatus('success', `Saved: "${data.title}"`);
    loadRecentSnaps(); // Refresh list
    
    // Reset button after delay
    setTimeout(() => {
      elements.saveBtn.disabled = false;
      elements.saveBtn.textContent = 'Save This Page';
      statusEl.classList.add('hidden');
    }, 3000);

  } catch (error) {
    showStatus('error', error.message);
    elements.saveBtn.disabled = false;
  }
}

// --- Load Recent Snaps ---
async function loadRecentSnaps() {
  try {
    const { data: snaps, error } = await supabaseClient
      .from('content_documents')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('source', 'W')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!snaps || snaps.length === 0) {
      elements.snapsListEl.innerHTML = '<div class="empty-state">No page snaps yet</div>';
      return;
    }

    elements.snapsListEl.innerHTML = snaps.map(snap => `
      <div class="snap-card" data-id="${snap.id}">
        <div class="snap-title">${snap.metadata?.title || 'Untitled'}</div>
        <div class="snap-meta">${snap.metadata?.category || 'note'} • ${new Date(snap.created_at).toLocaleDateString()}</div>
        <div class="snap-meta" style="margin-top: 4px; font-size: 10px; color: var(--muted);">
          ${(snap.metadata?.keywords || []).slice(0, 3).join(', ')}
        </div>
      </div>
    `).join('');

    // Add click handlers to snap cards
    document.querySelectorAll('.snap-card').forEach(card => {
      card.onclick = () => {
        const snapId = card.dataset.id;
        // Open snap in web dashboard
        chrome.tabs.create({ url: `${BACKEND_URL}/dashboard?id=${snapId}` });
      };
    });

  } catch (error) {
    elements.snapsListEl.innerHTML = `<div class="error">Failed to load snaps: ${error.message}</div>`;
  }
}

// --- Handle Logout ---
async function handleLogout() {
  try {
    await supabaseClient.auth.signOut();
    await chrome.storage.local.remove(['session', 'userId']);
    window.location.href = 'auth.html';
  } catch (error) {
    showStatus('error', 'Logout failed: ' + error.message);
  }
}

// --- Status Display ---
function showStatus(type, message) {
  elements.statusEl.className = `status ${type}`;
  elements.statusEl.textContent = message;
  elements.statusEl.classList.remove('hidden');
}