import axios from "axios";

const USE_LOCAL_API = false;

const LOCAL_API_URL = "http://localhost:8080";

const DEPLOYED_API_URL = import.meta.env.VITE_API_URL;

// Create a configured axios instance
const axiosInstance = axios.create({
  baseURL: USE_LOCAL_API ? LOCAL_API_URL : DEPLOYED_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
