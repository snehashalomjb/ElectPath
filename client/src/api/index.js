import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  res => res.data,
  err => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : 'Network error. Is the server running?');
    return Promise.reject(new Error(message));
  }
);

export const userApi = {
  save: (data) => api.post('/user', data),
  get:  (id)  => api.get(`/user/${id}`),
};

export const processApi = {
  getAll: () => api.get('/process'),
};

export const timelineApi = {
  getAll: () => api.get('/timeline'),
};

export const chatApi = {
  send: (message, history) => api.post('/chat', { message, history }),
};

export default api;
