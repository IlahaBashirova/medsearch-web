import { apiRequest } from "../../lib/apiClient.js";

export async function adminLoginApi(payload, signal) {
  const res = await apiRequest(`/api/admin/auth/login`, {
    method: "POST",
    body: payload,
    auth: false,
    signal
  });

  return {
    token: res?.token || "",
    user: { id: res.id, name: res.name, email: res.email, role: res.role }
  };
}
