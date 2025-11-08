// This runs on every page - lightweight, no heavy operations
console.log('SnapMind content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const selection = window.getSelection().toString();
    
    if (selection) {
      sendResponse({ content: selection, hasSelection: true });
      return;
    }
    
    // Extract main content
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    
    // Try to get article content
    const article = document.querySelector('article, .article, .post-content, .main-content');
    const content = article ? article.innerText : document.body.innerText;
    
    // Clean and limit
    const cleanContent = `${title}\n\n${metaDescription}\n\n${content}`
      .replace(/\s+/g, ' ')
      .substring(0, 2000);
    
    sendResponse({ content: cleanContent, hasSelection: false });
  }
});