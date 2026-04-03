import { getToken, touchSession } from "./auth.js";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiRequest(path, { method = "GET", body, signal, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal
  });

  if (res.ok) touchSession();

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = typeof data === "object" && data?.message ? data.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}