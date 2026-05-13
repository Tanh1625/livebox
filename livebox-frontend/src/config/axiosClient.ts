import axios from "axios";
import { useAuthStore } from "../features/auth/store/authStore";

// In development (npm run dev), default to localhost unless VITE_API_URL explicitly points elsewhere.
// Set VITE_USE_LOCAL=true in .env to force localhost even in other environments.
// const isDev = import.meta.env.DEV;
// const useLocal = import.meta.env.VITE_USE_LOCAL === "true" || isDev;
const useLocal = true;
const LOCAL_API_URL = "http://localhost:8080";
const DEPLOYED_API_URL = import.meta.env.VITE_API_URL as string;

const axiosClient = axios.create({
  baseURL: useLocal ? LOCAL_API_URL : DEPLOYED_API_URL,
  withCredentials: true,
});

// Add a request interceptor to attach token
axiosClient.interceptors.request.use(
  (config) => {
    // If the data is FormData, we explicitly remove Content-Type
    // so the browser can set it automatically with the correct "boundary"
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // fallback to useAuthStore.getState().accessToken later if used.
    // only store in memory.
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor to handle errors globally
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/v1/auth/refresh" &&
      originalRequest.url !== "/api/v1/auth/login"
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token - cookie will be sent automatically
        const response = await axios.post(
          `${axiosClient.defaults.baseURL}/api/v1/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          },
        );

        const newAccessToken = response.data?.data?.accessToken;

        if (newAccessToken) {
          useAuthStore.getState().setToken(newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return axiosClient(originalRequest);
        } else {
          throw new Error("No access token in response");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Token refresh failed. Redirecting to login...");
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
