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

export function getMyNotifications(params, signal) {
  return apiRequest(`/api/notifications${toQueryString(params)}`, { signal });
}

export function markNotificationRead(notificationId, signal) {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    signal
  });
}

export function markAllNotificationsRead(signal) {
  return apiRequest(`/api/notifications/read-all`, {
    method: "PATCH",
    signal
  });
}
