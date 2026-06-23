import axios from "axios";
import { clearAuthSession } from "../utils/session";

// Create an axios instance
const api = axios.create({
  baseURL: "/api", // all requests will be prefixed with /api
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set multipart boundary; a manual Content-Type breaks file uploads.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle forced logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response.data.force_logout) {
      clearAuthSession();

      // Redirect to login page
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

export default api;
