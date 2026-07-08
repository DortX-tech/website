import { useEffect } from "react";
import { API_URL } from "../config/api";

const VISITOR_KEY = "dortx_visitor_id";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);

  if (!id) {
    id =
      crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(VISITOR_KEY, id);
  }

  return id;
}

export default function useLiveVisitorHeartbeat() {
  useEffect(() => {
  const visitorId = getVisitorId();

  const SESSION_KEY = "dortx_visit_sent";

  if (sessionStorage.getItem(SESSION_KEY)) {
    return;
  }

  sessionStorage.setItem(SESSION_KEY, "true");

  fetch(`${API_URL}/analytics/visit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      visitorId,
      currentPage: window.location.pathname,
    }),
  }).catch(console.error);
}, []) };