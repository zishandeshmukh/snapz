// mobilef/utils/backend.js
import { BACKEND_API_URL } from './constants';

const headers = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getMemories = (token) =>
  fetch(`${BACKEND_API_URL}/memories`, { headers: headers(token) })
    .then(r=>r.ok?r.json():Promise.reject(r));

export const searchMemories = (token,q)=>
  fetch(`${BACKEND_API_URL}/search?q=${encodeURIComponent(q)}`,{headers:headers(token)})
    .then(r=>r.ok?r.json():Promise.reject(r));