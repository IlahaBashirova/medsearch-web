import { apiRequest } from "../../lib/apiClient.js";

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getAdminUsers(params, signal) {
  return apiRequest(`/api/admin/users${toQueryString(params)}`, { signal });
}

export function updateAdminUser(userId, payload, signal) {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: payload,
    signal
  });
}

export function getAdminPharmacies(params, signal) {
  return apiRequest(`/api/admin/pharmacies${toQueryString(params)}`, { signal });
}

export function createAdminPharmacy(payload, signal) {
  return apiRequest(`/api/admin/pharmacies`, {
    method: "POST",
    body: payload,
    signal
  });
}

export function getAdminMedicines(params, signal) {
  return apiRequest(`/api/admin/medicines${toQueryString(params)}`, { signal });
}

export function createAdminMedicine(payload, signal) {
  return apiRequest(`/api/admin/medicines`, {
    method: "POST",
    body: payload,
    signal
  });
}

export function updateAdminMedicine(medicineId, payload, signal) {
  return apiRequest(`/api/admin/medicines/${medicineId}`, {
    method: "PATCH",
    body: payload,
    signal
  });
}

export function getAdminReservations(params, signal) {
  return apiRequest(`/api/admin/reservations${toQueryString(params)}`, { signal });
}

export function updateAdminReservationStatus(reservationId, payload, signal) {
  return apiRequest(`/api/admin/reservations/${reservationId}/status`, {
    method: "PATCH",
    body: payload,
    signal
  });
}

export function getAdminReminders(params, signal) {
  return apiRequest(`/api/admin/reminders${toQueryString(params)}`, { signal });
}

export function updateAdminReminder(reminderId, payload, signal) {
  return apiRequest(`/api/admin/reminders/${reminderId}`, {
    method: "PATCH",
    body: payload,
    signal
  });
}

export function getAdminSupportConversations(params, signal) {
  return apiRequest(`/api/support${toQueryString(params)}`, { signal });
}

export function replyToSupportConversation(conversationId, payload, signal) {
  return apiRequest(`/api/support/${conversationId}/reply`, {
    method: "POST",
    body: payload,
    signal
  });
}

export function updateSupportConversationStatus(conversationId, payload, signal) {
  return apiRequest(`/api/support/${conversationId}/status`, {
    method: "PATCH",
    body: payload,
    signal
  });
}

export function getAdminAnalytics(signal) {
  return apiRequest(`/api/admin/analytics`, { signal });
}

export function getAdminSettings(signal) {
  return apiRequest(`/api/admin/settings`, { signal });
}

export function updateAdminSettings(payload, signal) {
  return apiRequest(`/api/admin/settings`, {
    method: "PATCH",
    body: payload,
    signal
  });
}

export function getAdminSystemInfo(signal) {
  return apiRequest(`/api/admin/settings/system-info`, { signal });
}

export function getAdminQuickActions(signal) {
  return apiRequest(`/api/admin/settings/quick-actions`, { signal });
}
