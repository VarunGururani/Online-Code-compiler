import axios from 'axios';

// Get base URL from environment or fallback to standard localhost API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create standard configured axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for secure HTTP-only session cookies
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo mode control: allows switching between Live Backend API and Local Sandbox Demo Mode
export const getIsDemoMode = () => {
  const saved = localStorage.getItem('cloud_ide_demo_mode');
  // Default to false (Live Backend API) so real code execution takes place
  return saved === 'true';
};

export const setIsDemoMode = (val) => {
  localStorage.setItem('cloud_ide_demo_mode', String(val));
};

// Check if the backend server is reachable
export const checkBackendHealth = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 3000,
      withCredentials: true,
    });
    return { ok: true, data: res.data };
  } catch (err) {
    // Also test root endpoint
    try {
      const rootRes = await axios.get(API_BASE_URL.replace(/\/api$/, ''), {
        timeout: 2000,
      });
      return { ok: true, data: rootRes.data };
    } catch {
      return { ok: false, error: err.message };
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error reporting
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
