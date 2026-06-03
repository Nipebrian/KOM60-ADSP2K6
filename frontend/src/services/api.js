import axios from 'axios';

// In dev: empty string routes requests through the Vite proxy configured in vite.config.js
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : 'https://ipb-food-hub-api.vercel.app');

export const getImageUrl = (path) => {
  if (!path) return null;
  if (/^(blob:|data:|https?:)/.test(path)) return path;
  const base = import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? '' : 'https://ipb-food-hub-api.vercel.app');
  return `${base}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Skip redirect on 401 for the login endpoint itself to avoid an infinite loop
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  // OAuth2PasswordRequestForm requires form-encoded body, not JSON
  login: (data) => api.post('/api/auth/login', new URLSearchParams({
    username: data.email,
    password: data.password
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  
  getMe: () => api.get('/api/auth/me'),
  updateMe: (data) => api.put('/api/auth/me', data),
};

export const umkmAPI = {
  list: (params) => api.get('/api/umkm', { params }),
  getById: (id) => api.get(`/api/umkm/${id}`),
  getMyToko: () => api.get('/api/umkm/me/toko'),
  create: (data) => api.post('/api/umkm', data),
  update: (id, data) => api.put(`/api/umkm/${id}`, data),
  delete: (id) => api.delete(`/api/umkm/${id}`),
  uploadFotoToko: (id, formData) => api.post(`/api/umkm/${id}/upload-foto`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadQris: (id, formData) => api.post(`/api/umkm/${id}/upload-qris`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const menuAPI = {
  list: (umkmId) => api.get(`/api/umkm/${umkmId}/menu`),
  create: (umkmId, data) => api.post(`/api/umkm/${umkmId}/menu`, data),
  update: (umkmId, menuId, data) => api.put(`/api/umkm/${umkmId}/menu/${menuId}`, data),
  delete: (umkmId, menuId) => api.delete(`/api/umkm/${umkmId}/menu/${menuId}`),
  uploadFoto: (umkmId, menuId, formData) => api.post(`/api/umkm/${umkmId}/menu/${menuId}/upload-foto`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const pesananAPI = {
  create: (data) => api.post('/api/pesanan', data),
  getMy: (params) => api.get('/api/pesanan/saya', { params }),
  getById: (id) => api.get(`/api/pesanan/${id}`),
  uploadBukti: (pesananId, formData) => api.post(
    `/api/pesanan/${pesananId}/bukti`, formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  ),
  getMasuk: (params) => api.get('/api/pesanan/umkm/masuk', { params }),
  updateStatus: (id, data) => api.put(`/api/pesanan/${id}/status`, data),
  verifikasiBukti: (id, data) => api.put(`/api/pesanan/${id}/verifikasi-bukti`, data),
  batalPesanan: (id) => api.put(`/api/pesanan/${id}/batal`),
};

export const ratingAPI = {
  listByUmkm: (umkmId, params) => api.get(`/api/rating/umkm/${umkmId}`, { params }),
  summary: (umkmId) => api.get(`/api/rating/umkm/${umkmId}/summary`),
  create: (data) => api.post('/api/rating', data),
  balas: (ratingId, data) => api.put(`/api/rating/${ratingId}/balasan`, data),
  delete: (id) => api.delete(`/api/rating/${id}`),
};

export const promoAPI = {
  listAll: () => api.get('/api/promo'),
  listByUmkm: (umkmId) => api.get(`/api/promo/umkm/${umkmId}`),
  create: (data) => api.post('/api/promo', data),
  update: (id, data) => api.put(`/api/promo/${id}`, data),
  delete: (id) => api.delete(`/api/promo/${id}`),
};

export const adminAPI = {
  stats: () => api.get('/api/admin/stats'),
  listUsers: (params) => api.get('/api/admin/users', { params }),
  updateUserStatus: (userId, status) => api.put(`/api/admin/users/${userId}/status?new_status=${status}`),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
};

export const securityAPI = {
  getStats: () => api.get('/api/security/stats'),
  getAuditLogs: (params) => api.get('/api/security/audit-logs', { params }),
};

export default api;
