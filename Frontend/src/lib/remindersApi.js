import { apiRequest } from "./apiClient.js";

export function getMyReminders(signal) {
  return apiRequest("/api/reminders", { signal });
}

export function createMyReminder(payload, signal) {
  return apiRequest("/api/reminders", {
    method: "POST",
    body: payload,
    signal
  });
}

export function deleteMyReminder(reminderId, signal) {
  return apiRequest(`/api/reminders/${reminderId}`, {
    method: "DELETE",
    signal
  });
}
