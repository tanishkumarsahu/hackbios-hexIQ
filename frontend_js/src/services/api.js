import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  search: async (searchTerm, filters = {}) => {
    const params = { q: searchTerm, ...filters };
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Generic API helper
export const apiRequest = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await api({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
