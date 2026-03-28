import React from "react";
import { Navigate } from "react-router-dom";
import { clearToken, getSessionUser, getToken, isGuestSession, isSessionExpired } from "../lib/auth.js";

export function RequireAppAccess({ children }) {
  const token = getToken();
  const guestSession = isGuestSession();

  if (!token && !guestSession) return <Navigate to="/auth" replace />;

  if (isSessionExpired()) {
    clearToken();
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/auth" replace />;

  if (isSessionExpired()) {
    clearToken();
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export function RequireGuest({ children }) {
  const token = getToken();
  const guestSession = isGuestSession();

  if (guestSession && isSessionExpired()) {
    clearToken();
    return children;
  }

  if (token && !isSessionExpired()) {
    const session = getSessionUser();
    return <Navigate to={session.isAdmin ? "/admin/dashboard" : "/home"} replace />;
  }

  return children;
}
