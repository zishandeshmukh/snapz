const BACKEND_API_URL = 'http://10.30.206.76:10000';   // same as constants

const headers = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getMemories = (token) =>
  fetch(`${BACKEND_API_URL}/memories`, { headers: headers(token) }).then((r) => r.json());

export const searchMemories = (token, q) =>
  fetch(`${BACKEND_API_URL}/search?q=${encodeURIComponent(q)}`, { headers: headers(token) }).then((r) => r.json());