// function runContentCapture() {
//     const hostname = window.location.hostname;
//     const pathname = window.location.pathname;
//     const currentUrl = window.location.href;
//     let pageData = {};

//     // --- Social Media ---

//     // 1. LinkedIn
//     if (hostname.includes("linkedin.com")) {
//         // LinkedIn Profile Page
//         if (pathname.includes("/in/")) {
//             console.log("LinkedIn Profile page detected.");
//             const nameElement = document.querySelector('h1');
//             const headlineElement = document.querySelector('.text-body-medium.break-words');
//             const aboutSection = document.querySelector('#about + div + div span[aria-hidden="true"]');
//             pageData = {
//                 type: "linkedin_profile",
//                 title: nameElement ? nameElement.innerText.trim() : document.title,
//                 url: currentUrl,
//                 textContent: `${nameElement?.innerText.trim()}\n${headlineElement?.innerText.trim()}\n\nAbout:\n${aboutSection?.innerText.trim()}`
//             };
//         // LinkedIn Feed
//         } else {
//             console.log("LinkedIn Feed detected.");
//             const postElements = document.querySelectorAll("div[data-urn^='urn:li:share:'], div[data-urn^='urn:li:activity:']");
//             const posts = [];
//             postElements.forEach(post => {
//                 const textEl = post.querySelector('.update-components-text');
//                 const authorEl = post.querySelector('.update-components-actor__name span[aria-hidden="true"]');
//                 const linkEl = post.querySelector('a.update-components-actor__sub-description-link');
//                 if (textEl) posts.push({ textContent: textEl.innerText.trim(), postLink: linkEl?.href, author: authorEl?.innerText.trim() });
//             });
//             pageData = { type: 'linkedin_feed', title: document.title, url: currentUrl, posts };
//         }
//     }

//     // 2. X.com (Twitter)
//     else if (hostname.includes("x.com")) {
//         console.log("X.com timeline detected.");
//         const postElements = document.querySelectorAll("article");
//         const posts = [];
//         postElements.forEach(post => {
//             const text = post.innerText.trim();
//             const linkEl = post.querySelector('a[href*="/status/"]');
//             if (text) posts.push({ textContent: text, postLink: linkEl?.href });
//         });
//         pageData = { type: 'twitter_timeline', title: document.title, url: currentUrl, posts };
//     }

//     // 3. Instagram
//     else if (hostname.includes("instagram.com")) {
//         console.log("Instagram page detected.");
//         const postElements = document.querySelectorAll("article");
//         const posts = [];
//         postElements.forEach(post => {
//             const authorEl = post.querySelector("header a");
//             const textEl = post.querySelector("h1, div[role='button'] ~ div span");
//             const linkEl = post.querySelector("a[href*='/p/'], a[href*='/reel/']");
//             if (authorEl && textEl) posts.push({ author: authorEl.innerText, textContent: textEl.innerText, postLink: linkEl?.href });
//         });
//         pageData = { type: 'instagram_feed', title: document.title, url: currentUrl, posts };
//     }
//     // --- Forums & Q&A ---

//     // 4. Reddit
//     else if (hostname.includes("reddit.com")) {
//         // Individual Reddit post
//         if (pathname.includes("/comments/")) {
//             console.log("Reddit post page detected.");
//             const postContent = document.querySelector('div[data-testid="post-content"]')?.innerText.trim() || '';
//             const comments = [];
//             document.querySelectorAll('div[id^="comment-"]').forEach(comment => {
//                 const author = comment.querySelector('a[data-testid="comment_author_link"]')?.innerText;
//                 const text = comment.querySelector('div[data-testid="comment"]')?.innerText;
//                 if(author && text) comments.push(`${author}: ${text}`);
//             });
//             pageData = { type: 'reddit_post', title: document.title, textContent: `${postContent}\n\nTop Comments:\n${comments.slice(0, 5).join('\n---\n')}` };
//         // Reddit Feed
//         } else {
//             console.log("Reddit feed detected.");
//             const postElements = document.querySelectorAll('div[data-testid="post-container"]');
//             const posts = [];
//             postElements.forEach(post => {
//                 const titleEl = post.querySelector('h3, [data-adclicklocation="title"]');
//                 const linkEl = post.querySelector('a[data-adclicklocation="title"]');
//                 if (titleEl) posts.push({ headline: titleEl.innerText, link: linkEl?.href });
//             });
//             pageData = { type: 'reddit_feed', title: document.title, url: currentUrl, posts };
//         }
//     }
    
//     // 5. Quora
//     else if (hostname.includes("quora.com")) {
//         console.log("Quora page detected.");
//         const question = document.querySelector('.qu-display--block')?.innerText || document.title;
//         const answers = [];
//         document.querySelectorAll('.qu-user-written-content').forEach(answer => answers.push(answer.innerText));
//         pageData = { type: 'quora_question', title: question, textContent: `Question: ${question}\n\nTop Answers:\n${answers.slice(0, 3).join('\n\n---\n\n')}` };
//     }

//     // --- Media ---
//   // 6. YouTube
//     else if (hostname.includes("youtube.com") && pathname.includes("/watch")) {
//         console.log("YouTube page detected.");
//         pageData = { type: "youtube_video", title: document.title, url: currentUrl };
//     }
    
//     // --- Documents ---
    
//     // 7. Local PDF Files
//     else if (currentUrl.startsWith("file://") && currentUrl.toLowerCase().endsWith(".pdf")) {
//         console.log("Local PDF file detected.");
//         pageData = { type: "local_pdf_file", title: pathname.split("/").pop(), url: currentUrl, textContent: "Local PDF file detected. For analysis, upload to the main app." };
//     }

//     // --- GENERALIZED RULE FOR NEWS & ARTICLES (using Readability.js) ---
//     else {
//         try {
//             const documentClone = document.cloneNode(true);
//             const reader = new Readability(documentClone);
//             const article = reader.parse();

//             if (article && article.textContent.length > 200) {
//                 console.log("Generalized article detected by Readability.");
//                 pageData = {
//                     type: 'article',
//                     title: article.title,
//                     url: currentUrl,
//                     textContent: article.textContent.trim()
//                 };
//             } else {
//                 console.log("Generic page detected. Capturing all visible text.");
//                 pageData = { type: "generic", title: document.title, url: currentUrl, textContent: document.body.innerText.trim() };
//             }
//         } catch (e) {
//              console.error("Error running Readability, using generic fallback.", e);
//              pageData = { type: "generic", title: document.title, url: currentUrl, textContent: document.body.innerText.trim() };
//         }
//     }
    
//     // Send the captured data to the backend
//     sendDataToBackend(pageData);
// }

// // --- Backend Sender Function (UPDATED) ---
// async function sendDataToBackend(data) {
//     const SERVER_URL = "http://localhost:3001/receive_data";
//     let rawTextToSend = "";

//     // --- THIS IS THE KEY CHANGE ---
//     // Add the main URL to the top of the text to give the AI a clear signal.
//     if (data.url) {
//         rawTextToSend += `Source URL: ${data.url}\n\n`;
//     }

//     // This part of the logic appends the rest of the text content
//     if (data.posts && data.posts.length > 0) {
//         const allText = data.posts.map(p => {
//             if (p.headline) return `${p.headline}\n${p.link || ''}`;
//             if (p.textContent) return `${p.textContent}\n${p.postLink || ''}`;
//             return "";
//         }).join("\n\n---\n\n");
//         rawTextToSend += allText;
//     } else if (data.textContent) {
//         rawTextToSend += data.textContent;
//     } else if (data.type === "youtube_video") {
//         rawTextToSend += `YouTube Video Title: ${data.title}`;
//     } else {
//         console.log("No text content to send for data type:", data.type);
//         return;
//     }

//     console.log("--- Sending Raw Text to Server ---");

//     try {
//         const response = await fetch(SERVER_URL, {
//             method: "POST",
//             headers: { "Content-Type": "text/plain" },
//             body: rawTextToSend
//         });
//         if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
//         const structuredData = await response.json();
//         console.log("--- Received Structured Data from Server ---", structuredData);
//     } catch (error) {
//         console.error("Failed to send data to server:", error);
//     }
// }

// // --- SCRIPT EXECUTION LOGIC ---
// runContentCapture();