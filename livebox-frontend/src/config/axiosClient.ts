import axios from 'axios';

// In development (npm run dev), default to localhost unless VITE_API_URL explicitly points elsewhere.
// Set VITE_USE_LOCAL=true in .env to force localhost even in other environments.
const isDev = import.meta.env.DEV;
const useLocal = import.meta.env.VITE_USE_LOCAL === 'true' || isDev;
const LOCAL_API_URL = 'http://localhost:8080';
const DEPLOYED_API_URL = import.meta.env.VITE_API_URL as string;

const axiosClient = axios.create({
  baseURL: useLocal ? LOCAL_API_URL : DEPLOYED_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach token
axiosClient.interceptors.request.use(
  (config) => {
    // We will retrieve the token from the zustand store or local storage later
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., logout user, redirect to login)
      console.error("Unauthorized! Redirecting to login...");
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
