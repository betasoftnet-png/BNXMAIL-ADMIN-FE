import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: `${API_BASE}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the admin token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bnx_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const adminApi = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),

  // --- Specific Helpers ---
  getUsers: (page = 0, size = 10, query = '') => 
    api.get(`/users`, { params: { page, size, query } }),
    
  toggleUserStatus: (userId) => 
    api.put(`/users/${userId}/status`),
    
  forceLogoutUser: (userId) => 
    api.post(`/users/${userId}/logout`)
};

export default adminApi;
