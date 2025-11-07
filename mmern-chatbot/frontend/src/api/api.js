
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';


const api = axios.create({
  baseURL: API_BASE,
});

export async function register(email, password, name) {
  const res = await api.post('/auth/register', { email, password, name });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function fetchProfile(token) {
  const res = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function sendMessage(token, text, sessionId = null) {
  const res = await api.post(
    '/chat',
    { text, sessionId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export default api;
