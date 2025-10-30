// Example share sender for mobile (React Native or plain JS)
// Use this after you capture title/description/url from the share extension.

async function sendShare({ serverBaseUrl, url, title, description, metadata }) {
  const payload = { url, title, description, metadata };

  const resp = await fetch(`${serverBaseUrl.replace(/\/$/, '')}/mobile/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'x-api-key': '<OPTIONAL_CLIENT_API_KEY>' // if you add API key auth
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Server returned ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  return json; // structured result from AI pipeline
}

// Usage example:
// sendShare({ serverBaseUrl: 'http://10.0.2.2:3001', url: 'https://example.com', title: 'Hello', description: 'Snippet' })
//   .then(console.log).catch(console.error);

export default sendShare;
