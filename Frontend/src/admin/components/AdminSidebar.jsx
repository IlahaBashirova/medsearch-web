import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../../lib/auth.js";

const navItems = [
  { label: "Dashboard", icon: "fa-solid fa-table-columns", to: "/admin/dashboard", implemented: true },
  { label: "İstifadəçilər", icon: "fa-regular fa-user", to: "/admin/users", implemented: true },
  { label: "Apteklər", icon: "fa-regular fa-hospital", to: "/admin/pharmacies", implemented: true },
  { label: "Yadda saxlanan dərmanlar", icon: "fa-regular fa-calendar", to: "/admin/reservations", implemented: true },
  { label: "Dərmanlar", icon: "fa-solid fa-capsules", to: "/admin/medicines", implemented: true },
  { label: "Xatırlatmalar", icon: "fa-regular fa-bell", to: "/admin/reminders", implemented: true },
  { label: "Dəstək / Chat", icon: "fa-regular fa-message", to: "/admin/support", implemented: true },
  { label: "Analitika", icon: "fa-solid fa-chart-column", to: "/admin/analytics", implemented: true },
  { label: "Parametrlər", icon: "fa-solid fa-gear", to: "/admin/settings", implemented: true }
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo">MS</div>
        <div className="admin-sidebar__brand-text">MedSearch Admin</div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {navItems.map((item) =>
          item.implemented ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`
              }
            >
              <i className={item.icon} aria-hidden="true"></i>
              <span>{item.label}</span>
            </NavLink>
          ) : (
            <button key={item.label} type="button" className="admin-sidebar__link admin-sidebar__link--muted">
              <i className={item.icon} aria-hidden="true"></i>
              <span>{item.label}</span>
            </button>
          )
        )}
      </nav>

      <button
        type="button"
        className="admin-sidebar__logout"
        onClick={() => {
          clearToken();
          navigate("/admin/login", { replace: true });
        }}
      >
        <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
        <span>Çıxış</span>
      </button>
    </aside>
  );
}
