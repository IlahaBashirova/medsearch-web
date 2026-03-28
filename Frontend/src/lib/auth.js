const LS_TOKEN_KEY = "medsearch_token_v1";
const LS_LAST_ACTIVE_KEY = "medsearch_last_active_v1";
const LS_SESSION_KIND_KEY = "medsearch_session_kind_v1";

export const SESSION_TTL_MS = 30 * 60 * 1000; // 30 dəq

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4 || 4)) % 4;
  return atob(`${normalized}${"=".repeat(paddingLength)}`);
}

export function getSessionUser() {
  if (isGuestSession()) {
    return {
      id: "",
      email: "",
      role: "GUEST",
      isAdmin: false,
      isGuest: true
    };
  }

  const token = getToken();

  if (!token) {
    return { id: "", email: "", role: "", isAdmin: false, isGuest: false };
  }

  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1] || ""));
    const role = payload?.role || "";

    return {
      id: payload?.id || "",
      email: payload?.email || "",
      role,
      isAdmin: role === "ADMIN",
      isGuest: false
    };
  } catch {
    return { id: "", email: "", role: "", isAdmin: false, isGuest: false };
  }
}

export function getToken() {
  return localStorage.getItem(LS_TOKEN_KEY) || "";
}

export function setToken(token) {
  localStorage.setItem(LS_TOKEN_KEY, token);
  localStorage.setItem(LS_SESSION_KIND_KEY, "auth");
  localStorage.setItem(LS_LAST_ACTIVE_KEY, String(Date.now()));
}

export function startGuestSession() {
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.setItem(LS_SESSION_KIND_KEY, "guest");
  localStorage.setItem(LS_LAST_ACTIVE_KEY, String(Date.now()));
}

export function isGuestSession() {
  return localStorage.getItem(LS_SESSION_KIND_KEY) === "guest";
}

export function clearToken() {
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.removeItem(LS_LAST_ACTIVE_KEY);
  localStorage.removeItem(LS_SESSION_KIND_KEY);
}

export function touchSession() {
  if (getToken() || isGuestSession()) localStorage.setItem(LS_LAST_ACTIVE_KEY, String(Date.now()));
}

export function isSessionExpired() {
  const hasSession = Boolean(getToken()) || isGuestSession();
  if (!hasSession) return true;
  const t = Number(localStorage.getItem(LS_LAST_ACTIVE_KEY) || 0);
  if (!t) return false;
  return Date.now() - t > SESSION_TTL_MS;
}
