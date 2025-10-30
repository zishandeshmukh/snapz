document.addEventListener("DOMContentLoaded", () => {
  const captureBtn = document.getElementById("captureBtn");
  const status = document.getElementById("status");
  const resultBox = document.getElementById("resultBox");
  const resultText = document.getElementById("resultText");

  captureBtn.addEventListener("click", async () => {
    status.textContent = "Capturing page content...";
    resultBox.hidden = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });

      status.textContent = "✅ Page capture initiated!";
    } catch (err) {
      console.error(err);
      status.textContent = "❌ Failed to capture page content.";
    }
  });
});
