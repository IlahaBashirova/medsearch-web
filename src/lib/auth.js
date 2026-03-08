const LS_TOKEN_KEY = "medsearch_token_v1";
const LS_LAST_ACTIVE_KEY = "medsearch_last_active_v1";

export const SESSION_TTL_MS = 30 * 60 * 1000; // 30 dəq

export function getToken() {
  return localStorage.getItem(LS_TOKEN_KEY) || "";
}

export function setToken(token) {
  localStorage.setItem(LS_TOKEN_KEY, token);
  localStorage.setItem(LS_LAST_ACTIVE_KEY, String(Date.now()));
}

export function clearToken() {
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.removeItem(LS_LAST_ACTIVE_KEY);
}

export function touchSession() {
  if (getToken()) localStorage.setItem(LS_LAST_ACTIVE_KEY, String(Date.now()));
}

export function isSessionExpired() {
  const token = getToken();
  if (!token) return true;
  const t = Number(localStorage.getItem(LS_LAST_ACTIVE_KEY) || 0);
  if (!t) return false;
  return Date.now() - t > SESSION_TTL_MS;
}