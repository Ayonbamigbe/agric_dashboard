import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  uploadCropYield: (data) =>
    axios.post(`${API_BASE_URL}/data/crop-yield`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
  uploadWeather: (data) =>
    axios.post(`${API_BASE_URL}/data/weather`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
  uploadMarketPrice: (data) =>
    axios.post(`${API_BASE_URL}/data/market-price`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
};

export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard'),
  getRegionalData: (region) => api.get(`/dashboard/region/${region}`),
};

export const dataAPI = {
  getCropYields: (params) => api.get('/data/crop-yields', { params }),
  getWeatherData: (params) => api.get('/data/weather', { params }),
  getSoilData: (params) => api.get('/data/soil', { params }),
  getMarketPrices: (params) => api.get('/data/market-prices', { params }),
  exportData: (type, params) => api.get(`/data/export/${type}`, { params, responseType: 'blob' }),
};

export default api;