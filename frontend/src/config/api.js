import axios from "axios";

const RENDER_BACKEND_URL = "https://dortx-backend.onrender.com";
const configuredBackendUrl = process.env.REACT_APP_BACKEND_URL || "";

function resolveBackendUrl(value) {
  const url = String(value || "").trim().replace(/\/$/, "");
  if (!url) return RENDER_BACKEND_URL;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "dortx-backend.onrender.com") {
      return RENDER_BACKEND_URL;
    }
  } catch {
    return RENDER_BACKEND_URL;
  }
  return url;
}

export const BACKEND_URL = resolveBackendUrl(configuredBackendUrl);
export const API_URL = `${BACKEND_URL}/api`;

export const apiClient = axios.create({ baseURL: API_URL });

export const adminApiClient = axios.create({ baseURL: API_URL });

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("dortx-admin-token") || "";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error?.response?.status)) {
      localStorage.removeItem("dortx-admin-token");
      localStorage.removeItem("dortx-admin-name");
      localStorage.removeItem("dortx-admin-email");
      localStorage.removeItem("dortx-admin-avatar");
      if (window.location.pathname !== "/admin/login") {
        window.location.assign("/admin/login");
      }
    }
    return Promise.reject(error);
  }
);
