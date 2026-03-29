import { apiRequest } from "./apiClient.js";

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getMySupportConversation(params, signal) {
  return apiRequest(`/api/support/my${toQueryString(params)}`, { signal });
}

export function sendSupportMessage(payload, signal) {
  return apiRequest(`/api/support`, {
    method: "POST",
    body: payload,
    signal
  });
}
