import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "@/config/api";

const VISITOR_KEY = "dortx-live-visitor-id";
const PUBLIC_VISIT_PATHS = new Set([
  "/",
  "/about",
  "/services",
  "/technologies",
  "/process",
  "/team",
  "/portfolio",
  "/contact",
]);

function getVisitorId() {
  if (typeof window === "undefined") return "";
  const existing = window.sessionStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const next = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(VISITOR_KEY, next);
  return next;
}

export default function useLiveVisitorHeartbeat(enabled = true) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return undefined;
    const visitorId = getVisitorId();
    if (!visitorId) return undefined;

    let cancelled = false;
    const currentPage = `${location.pathname}${location.search || ""}${location.hash || ""}`;
    const publicPath = location.pathname.replace(/\/+$/, "") || "/";

    const sendHeartbeat = async () => {
      try {
        await apiClient.post("/live/heartbeat", { visitorId, currentPage });
      } catch {
        // Visitor tracking must never affect the public website experience.
      }
    };

    if (PUBLIC_VISIT_PATHS.has(publicPath)) {
      apiClient.post("/analytics/visit", { visitorId, currentPage }).catch(() => {
        // Visit analytics must never affect the public website experience.
      });
    }

    sendHeartbeat();
    const timer = window.setInterval(() => {
      if (!cancelled) sendHeartbeat();
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, location.pathname, location.search, location.hash]);
}
