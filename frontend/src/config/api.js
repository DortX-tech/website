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
