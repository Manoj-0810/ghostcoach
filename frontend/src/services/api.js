import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ghostcoach_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 and 403 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('ghostcoach_token');
      localStorage.removeItem('ghostcoach_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// ─── Sessions ────────────────────────────────────────
export const uploadSession = (file, config = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/sessions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s for AI processing
    ...config
  });
};

export const getSessions = (page = 0, size = 10) =>
  api.get(`/sessions?page=${page}&size=${size}`);

export const getSession = (id) => api.get(`/sessions/${id}`);

export const getProgress = () => api.get('/sessions/progress');

export const compareSessions = (id1, id2) =>
  api.get(`/sessions/compare?id1=${id1}&id2=${id2}`);

export const deleteSession = (id) => api.delete(`/sessions/${id}`);

// ─── Chat ────────────────────────────────────────────
export const sendChatMessage = (sessionId, message) =>
  api.post(`/sessions/${sessionId}/chat`, { message });

export const getChatHistory = (sessionId) =>
  api.get(`/sessions/${sessionId}/chat`);

export default api;
