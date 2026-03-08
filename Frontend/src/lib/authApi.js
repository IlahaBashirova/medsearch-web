import { apiRequest } from "./apiClient.js";

export async function registerApi(payload, signal) {
  const res = await apiRequest(`/api/auth/register`, { method: "POST", body: payload, auth: false, signal });
  return { token: res?.token || "", user: { id: res.id, name: res.name, email: res.email, role: res.role } };
}

export async function loginApi(payload, signal) {
  const res = await apiRequest(`/api/auth/login`, { method: "POST", body: payload, auth: false, signal });
  return { token: res?.token || "", user: { id: res.id, name: res.name, email: res.email, role: res.role } };
}

export async function meApi(signal) {
  return apiRequest(`/api/auth/me`, { signal });
}