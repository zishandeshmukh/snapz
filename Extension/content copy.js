// --- Waiter Function ---
function waitForElement(selector, callback) {
    const maxChecks = 100; // Wait for max 10 seconds (100 × 100ms)
    let checks = 0;
    const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            callback();
            return;
        }
        checks++;
        if (checks >= maxChecks) {
            clearInterval(interval);
            console.log("Element did not appear in time. Running fallback.");
            callback();
        }
    }, 100);
}

// --- Instagram Interaction Tracker ---
function setupInstagramInteractionTracker() {
    console.log("Instagram interaction tracker activated.");

    function capturePostContext(postElement) {
        try {
            const author = postElement.querySelector("header a")?.innerText || "Unknown Author";
            const link = postElement.querySelector("a[href*='/p/']")?.href || window.location.href;
            const text = postElement.querySelector("div[role='button'] ~ div")?.innerText || "";

            const postData = {
                type: "instagram_interaction",
                author,
                postLink: link,
                textContent: text,
                timestamp: new Date().toISOString()
            };

            console.log("Captured Instagram interaction:", postData);

            fetch("http://localhost:3001/receive_data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData)
            });
        } catch (err) {
            console.error("Error capturing Instagram post context:", err);
        }
    }

    // Observe new posts (infinite scroll)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.tagName === "ARTICLE") {
                    const likeButton = node.querySelector("svg[aria-label='Like']");
                    if (likeButton) {
                        likeButton.addEventListener("click", () => capturePostContext(node));
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan
    document.querySelectorAll("article").forEach(article => {
        const likeButton = article.querySelector("svg[aria-label='Like']");
        if (likeButton) {
            likeButton.addEventListener("click", () => capturePostContext(article));
        }
    });
}

// --- Main Capture Logic ---
function runContentCapture() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const currentUrl = window.location.href;
    let pageData = {};

    // --- 1. X.com (Twitter) ---
    if (hostname.includes("x.com")) {
        console.log("X.com timeline detected. Capturing posts.");
        const postElements = document.querySelectorAll("article");
        const posts = [];

        postElements.forEach(postElement => {
            const postText = postElement.innerText.trim();
            const linkElement = postElement.querySelector('a[href*="/status/"]');
            const postLink = linkElement ? linkElement.href : null;
            const videoElement = postElement.querySelector("video");
            const videoSrc = videoElement ? videoElement.src : null;

            if (postText) {
                posts.push({
                    textContent: postText,
                    postLink: postLink,
                    videoSrc: videoSrc
                });
            }
        });

        pageData = {
            type: "twitter_timeline",
            title: document.title,
            url: currentUrl,
            posts: posts
        };
        sendDataToBackend(pageData);

    // --- 2. YouTube Video ---
    } else if (hostname.includes("youtube.com") && pathname.includes("/watch")) {
        console.log("YouTube page detected. Capturing video URL.");
        pageData = {
            type: "youtube_video",
            title: document.title,
            url: currentUrl
        };
        sendDataToBackend(pageData);

    // --- 3. Instagram ---
    } else if (hostname.includes("instagram.com")) {
        console.log("Instagram page detected. Interaction tracking enabled.");
        setupInstagramInteractionTracker();
        return; // Stop further scraping for Instagram

    // --- 4. Indian Express ---
    } else if (hostname.includes("indianexpress.com")) {
        if (pathname.includes("/article/")) {
            console.log("Indian Express ARTICLE page detected.");
            try {
                const mainContainer = document.querySelector("div#pcl-full-content, div.full-details");
                const articleBody = mainContainer ? mainContainer.querySelector("div.story_details") : null;

                if (articleBody) {
                    const textContent = articleBody.innerText.trim();
                    const allImages = mainContainer.querySelectorAll("img");
                    const imageUrls = Array.from(allImages)
                        .map(img => img.src)
                        .filter(src => src && /\.(jpg|jpeg|png)$/i.test(src));

                    pageData = {
                        type: "indian_express_article",
                        title: document.title,
                        url: currentUrl,
                        textContent: textContent,
                        imageUrls: imageUrls
                    };
                } else {
                    pageData = {
                        type: "generic",
                        title: document.title,
                        url: currentUrl,
                        textContent: document.body.innerText.trim()
                    };
                }
                sendDataToBackend(pageData);
            } catch (error) {
                console.error("Error parsing Indian Express article:", error);
            }
        } else {
            console.log("Indian Express HOMEPAGE detected.");
            const storyElements = document.querySelectorAll("div.top-news-premium div.news, div.other-news");
            const stories = [];

            storyElements.forEach(storyElement => {
                const linkElement = storyElement.querySelector("a");
                const headlineElement = storyElement.querySelector("h3, .title");
                if (linkElement && headlineElement) {
                    stories.push({
                        headline: headlineElement.innerText.trim(),
                        link: linkElement.href
                    });
                }
            });

            pageData = {
                type: "indian_express_homepage",
                title: document.title,
                url: currentUrl,
                stories: stories
            };
            sendDataToBackend(pageData);
        }

    // --- 5. Local PDF Files ---
    } else if (currentUrl.startsWith("file://") && currentUrl.toLowerCase().endsWith(".pdf")) {
        console.log("Local PDF file detected.");
        pageData = {
            type: "local_pdf_file",
            title: pathname.split("/").pop(),
            url: currentUrl,
            message: "To summarize this PDF, please upload it to the application."
        };
        sendDataToBackend(pageData);
        return;

    // --- 6. Generic Articles or Other Pages ---
    } else {
        const articleElement = document.querySelector("article, [role='main'], #main, #content");
        if (articleElement) {
            console.log("Article-like page detected. Capturing main content.");
            pageData = {
                type: "article",
                title: document.title,
                url: currentUrl,
                textContent: articleElement.innerText.trim()
            };
        } else {
            console.log("Generic page detected. Capturing all visible text.");
            pageData = {
                type: "generic",
                title: document.title,
                url: currentUrl,
                textContent: document.body.innerText.trim()
            };
        }
        sendDataToBackend(pageData);
    }
}

// --- Backend Sender Function ---
async function sendDataToBackend(data) {
    const SERVER_URL = "http://localhost:3001/receive_data";
    let rawTextToSend = "";
console.log(data)
    if (data.posts && data.posts.length > 0) {
        const allText = data.posts.map(p => {
            if (p.headline) return `${p.headline}\n${p.link}`;
            if (p.textContent) return `${p.textContent}\n${p.postLink}`;
            return "";
        }).join("\n\n---\n\n");
        rawTextToSend = allText;

    } else if (data.textContent) {
        rawTextToSend = data.textContent;

    } else if (data.type === "youtube_video") {
        rawTextToSend = `YouTube Video Title: ${data.title}\nURL: ${data.url}`;

    } else {
        console.log("No text content found to send to the backend for data type:", data.type);
        return;
    }

    console.log("--- Sending Raw Text to Server ---");

    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: rawTextToSend
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const structuredDataFromServer = await response.json();
        console.log("--- Received Structured Data from Server ---");
        console.log(structuredDataFromServer);
    } catch (error) {
        console.error("Failed to send data to server:", error);
    }
}

// --- SCRIPT EXECUTION LOGIC ---
const hostname = window.location.hostname;
const pathname = window.location.pathname;

if (hostname.includes("indianexpress.com") && pathname.includes("/article/")) {
    waitForElement("div.story_details", runContentCapture);
} else {
    runContentCapture();
}
