import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import PharmacyDetailPage from "./pages/PharmacyDetailPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { RequireAppAccess, RequireAuth, RequireGuest } from "./components/RouteGuards.jsx";
import ReservationsPage from "./pages/ReservationsPage.jsx";
import { RequireAdmin } from "./admin/components/AdminRouteGuards.jsx";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage.jsx";
import AdminUsersPage from "./admin/pages/AdminUsersPage.jsx";
import AdminPharmaciesPage from "./admin/pages/AdminPharmaciesPage.jsx";
import AdminCreatePharmacyPage from "./admin/pages/AdminCreatePharmacyPage.jsx";
import AdminMedicinesPage from "./admin/pages/AdminMedicinesPage.jsx";
import AdminReservationsPage from "./admin/pages/AdminReservationsPage.jsx";
import AdminRemindersPage from "./admin/pages/AdminRemindersPage.jsx";
import AdminSupportPage from "./admin/pages/AdminSupportPage.jsx";
import AdminAnalyticsPage from "./admin/pages/AdminAnalyticsPage.jsx";
import AdminSettingsPage from "./admin/pages/AdminSettingsPage.jsx";
import AdminNotificationsPage from "./admin/pages/AdminNotificationsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/admin/login" element={<Navigate to="/auth" replace />} />

        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminUsersPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/pharmacies"
          element={
            <RequireAdmin>
              <AdminPharmaciesPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/pharmacies/new"
          element={
            <RequireAdmin>
              <AdminCreatePharmacyPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/medicines"
          element={
            <RequireAdmin>
              <AdminMedicinesPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/reservations"
          element={
            <RequireAdmin>
              <AdminReservationsPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/reminders"
          element={
            <RequireAdmin>
              <AdminRemindersPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/support"
          element={
            <RequireAdmin>
              <AdminSupportPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <RequireAdmin>
              <AdminNotificationsPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <RequireAdmin>
              <AdminAnalyticsPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <RequireAdmin>
              <AdminSettingsPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/auth"
          element={
            <RequireGuest>
              <AuthPage />
            </RequireGuest>
          }
        />

        <Route
         path="/reservations"
         element={
            <RequireAuth>
            <ReservationsPage />
        </RequireAuth>
       }
/>

        <Route
          path="/home"
          element={
            <RequireAppAccess>
              <HomePage />
            </RequireAppAccess>
          }
        />
        <Route
          path="/results"
          element={
            <RequireAppAccess>
              <ResultsPage />
            </RequireAppAccess>
          }
        />
        <Route
          path="/pharmacy/:id"
          element={
            <RequireAppAccess>
              <PharmacyDetailPage />
            </RequireAppAccess>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
