import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "@/config/api";

const VISITOR_KEY = "dortx-live-visitor-id";

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

    const sendHeartbeat = async () => {
      try {
        await apiClient.post("/live/heartbeat", { visitorId, currentPage });
      } catch {
        // Visitor tracking must never affect the public website experience.
      }
    };

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
