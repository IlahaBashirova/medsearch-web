import { apiRequest } from "./apiClient.js";

export async function createReservation(payload, signal) {
  return apiRequest(`/api/reservations/create`, { method: "POST", body: payload, signal });
}

export async function getUserReservations(userId, signal) {
  return apiRequest(`/api/reservations/user/${userId}`, { signal });
}

export async function getUserReservationStats(userId, signal) {
  return apiRequest(`/api/reservations/user/${userId}/stats`, { signal });
}

export async function getReservationById(reservationId, signal) {
  return apiRequest(`/api/reservations/${reservationId}`, { signal });
}

export async function updateReservationStatus(reservationId, status, signal) {
  return apiRequest(`/api/reservations/${reservationId}/status`, {
    method: "PATCH",
    body: { status },
    signal
  });
}