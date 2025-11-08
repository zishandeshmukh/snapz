// SnapMind Content Scraper v2 - Hybrid Architecture

console.log('SnapMind: Advanced content scraper loaded');

// Your original platform-specific logic - preserved
function runAdvancedScraping() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const currentUrl = window.location.href;
    let metadata = {
        type: "generic",
        title: document.title,
        url: currentUrl,
        textContent: ""
    };

    // --- Social Media ---

    // 1. LinkedIn
    if (hostname.includes("linkedin.com")) {
        if (pathname.includes("/in/")) {
            const nameElement = document.querySelector('h1');
            const headlineElement = document.querySelector('.text-body-medium.break-words');
            const aboutSection = document.querySelector('#about + div + div span[aria-hidden="true"]');
            metadata = {
                type: "linkedin_profile",
                title: nameElement ? nameElement.innerText.trim() : document.title,
                url: currentUrl,
                textContent: `${nameElement?.innerText.trim()}\n${headlineElement?.innerText.trim()}\n\nAbout:\n${aboutSection?.innerText.trim()}`.substring(0, 2000)
            };
        } else {
            const postElements = document.querySelectorAll("div[data-urn^='urn:li:share:'], div[data-urn^='urn:li:activity:']");
            const posts = Array.from(postElements).slice(0, 3).map(post => {
                const textEl = post.querySelector('.update-components-text');
                const authorEl = post.querySelector('.update-components-actor__name span[aria-hidden="true"]');
                const linkEl = post.querySelector('a.update-components-actor__sub-description-link');
                return textEl?.innerText.trim();
            }).filter(Boolean);
            metadata = { type: 'linkedin_feed', title: document.title, url: currentUrl, textContent: posts.join('\n\n---\n\n') };
        }
    }

    // 2. X.com (Twitter)
    else if (hostname.includes("x.com")) {
        const posts = Array.from(document.querySelectorAll("article")).slice(0, 3).map(post => {
            const text = post.innerText.trim();
            return text.length > 50 ? text.substring(0, 500) : null;
        }).filter(Boolean);
        metadata = { type: 'twitter_timeline', title: document.title, url: currentUrl, textContent: posts.join('\n\n---\n\n') };
    }

    // 3. Instagram
    else if (hostname.includes("instagram.com")) {
        const posts = Array.from(document.querySelectorAll("article")).slice(0, 3).map(post => {
            const authorEl = post.querySelector("header a");
            const textEl = post.querySelector("h1, div[role='button'] ~ div span");
            return textEl?.innerText.trim();
        }).filter(Boolean);
        metadata = { type: 'instagram_feed', title: document.title, url: currentUrl, textContent: posts.join('\n\n---\n\n') };
    }

    // 4. Reddit
    else if (hostname.includes("reddit.com")) {
        if (pathname.includes("/comments/")) {
            const postContent = document.querySelector('div[data-testid="post-content"]')?.innerText.trim() || '';
            metadata = { type: 'reddit_post', title: document.title, textContent: postContent.substring(0, 2000) };
        } else {
            const posts = Array.from(document.querySelectorAll('div[data-testid="post-container"]')).slice(0, 5).map(post => {
                return post.querySelector('h3')?.innerText.trim();
            }).filter(Boolean);
            metadata = { type: 'reddit_feed', title: document.title, url: currentUrl, textContent: posts.join('\n\n') };
        }
    }

    // 5. Quora
    else if (hostname.includes("quora.com")) {
        const question = document.querySelector('.qu-display--block')?.innerText || document.title;
        metadata = { type: 'quora_question', title: question, textContent: question.substring(0, 2000) };
    }

    // 6. YouTube
    else if (hostname.includes("youtube.com") && pathname.includes("/watch")) {
        metadata = { type: "youtube_video", title: document.title, url: currentUrl, textContent: `YouTube Video: ${document.title}` };
    }

    // 7. PDF Files
    else if (currentUrl.startsWith("file://") && currentUrl.toLowerCase().endsWith(".pdf")) {
        metadata = { type: "local_pdf_file", title: pathname.split("/").pop(), url: currentUrl, textContent: "Local PDF detected" };
    }

    // 8. Generic Article (using Readability fallback)
    else {
        const textContent = document.body.innerText
          .replace(/\s+/g, ' ')
          .substring(0, 2000);
        metadata = { type: "generic", title: document.title, url: currentUrl, textContent };
    }

    return metadata;
}

// --- NEW: Message Listener for Popup ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
        try {
            const metadata = runAdvancedScraping();
            
            // Add user's selection if present
            const selection = window.getSelection().toString().trim();
            if (selection && selection.length > 50) {
                metadata.textContent = `SELECTED TEXT:\n${selection}\n\nFULL PAGE:\n${metadata.textContent}`;
            }
            
            sendResponse({ success: true, metadata });
        } catch (error) {
            console.error('Scraping error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
});