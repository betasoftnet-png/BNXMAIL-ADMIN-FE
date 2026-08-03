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
  searchUsers: (query, page = 0, size = 10) => 
    api.get(`/users?query=${query || ''}&page=${page}&size=${size}`),
    
  toggleUserStatus: (id) => 
    api.put(`/users/${id}/status`),
    
  forceLogoutUser: (id) => 
    api.post(`/users/${id}/logout`),

  resetPasswordUser: (id, newPassword) =>
    api.post(`/users/${id}/reset-password`, { newPassword }),

  getAbuseCase: (id) =>
    api.get(`/cases/${id}`),

  decideAbuseCase: (userId, decision) =>
    api.put(`/cases/${userId}/decide`, { decision }),

  sendGlobalBroadcast: (subject, message) =>
    api.post(`/system/broadcast`, { subject, message }),

  forceLogoutByEmail: (email) =>
    api.post(`/system/force-logout-by-email`, { email }),

  getSystemSettings: () =>
    api.get(`/system/settings`),
    
  updateSystemSettings: (settings) =>
    api.put(`/system/settings`, settings),

  getAuditLogs: (query, page = 0, size = 10) =>
    api.get(`/audit-logs?query=${query || ''}&page=${page}&size=${size}`)
};

export default adminApi;
