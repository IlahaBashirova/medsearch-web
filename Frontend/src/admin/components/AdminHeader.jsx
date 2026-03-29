import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../../lib/auth.js";
import { jwtDecode } from "../../lib/jwtDecode.js";
import { getMyNotifications } from "../../lib/notificationsApi.js";

export default function AdminHeader({ title, subtitle }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const admin = useMemo(() => {
    const token = getToken();
    const decoded = token ? jwtDecode(token) : null;

    return {
      name: decoded?.name || "Admin",
      email: decoded?.email || "admin@medsearch.az"
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        const result = await getMyNotifications({ limit: 1, unreadOnly: "true" });
        if (!mounted) return;
        setUnreadCount(result?.unreadCount || 0);
      } catch {
        if (!mounted) return;
        setUnreadCount(0);
      }
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 10000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  function handleLogout() {
    clearToken();
    setIsOpen(false);
    navigate("/admin/login", { replace: true });
  }

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button type="button" className="admin-header__menu" aria-label="Menu">
          <i className="fa-solid fa-bars"></i>
        </button>

        <label className="admin-search" aria-label="Search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="text" placeholder="Axtar..." />
        </label>
      </div>

      <div className="admin-header__right">
        <button
          type="button"
          className="admin-header__icon"
          aria-label="Notifications"
          onClick={() => navigate("/admin/notifications")}
        >
          <i className="fa-regular fa-bell"></i>
          {unreadCount > 0 ? <span className="admin-header__dot" /> : null}
        </button>

        <div className="admin-profile-menu" ref={menuRef}>
          <button
            type="button"
            className={`admin-user-chip admin-user-chip--button${isOpen ? " admin-user-chip--open" : ""}`}
            onClick={() => setIsOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
          >
            <div className="admin-user-chip__avatar">
              <i className="fa-regular fa-user"></i>
            </div>
            <div className="admin-user-chip__meta">
              <strong>{admin.name}</strong>
              <span>{admin.email}</span>
            </div>
            <i className="fa-solid fa-chevron-down admin-user-chip__caret" aria-hidden="true"></i>
          </button>

          {isOpen ? (
            <div className="admin-profile-dropdown" role="menu" aria-label="Admin menu">
              <div className="admin-profile-dropdown__head">
                <strong>{admin.name}</strong>
                <span>{admin.email}</span>
              </div>

              <button type="button" className="admin-profile-dropdown__action" role="menuitem" onClick={handleLogout}>
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
                <span>Çıxış</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="admin-page-head">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </header>
  );
}
