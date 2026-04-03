import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "../../lib/notificationsApi.js";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    abortRef.current?.abort?.();
    const ac = new AbortController();
    abortRef.current = ac;

    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const result = await getMyNotifications({ limit: 40 }, ac.signal);
      setNotifications(Array.isArray(result?.data) ? result.data : []);
      setUnreadCount(result?.unreadCount || 0);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Bildirişləri yükləmək mümkün olmadı");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(() => {
      loadNotifications({ silent: true });
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
      abortRef.current?.abort?.();
    };
  }, [loadNotifications]);

  async function handleMarkRead(notificationId) {
    setActionLoading(notificationId);

    try {
      await markNotificationRead(notificationId);
      await loadNotifications();
    } catch (err) {
      window.alert(err?.message || "Bildiriş yenilənmədi");
    } finally {
      setActionLoading("");
    }
  }

  async function handleMarkAllRead() {
    setActionLoading("all");

    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch (err) {
      window.alert(err?.message || "Bildirişlər yenilənmədi");
    } finally {
      setActionLoading("");
    }
  }

  async function handleOpenNotification(item) {
    const conversationId = item.relatedConversationId?._id;

    if (!conversationId) return;

    setActionLoading(item._id);

    try {
      if (!item.isRead) {
        await markNotificationRead(item._id);
      }

      navigate(`/admin/support?conversationId=${conversationId}`);
    } catch (err) {
      window.alert(err?.message || "Bildiriş açıla bilmədi");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <AdminLayout title="Bildirişlər" subtitle="Yeni mesaj və dəstək yeniləmələrini izləyin">
      <section className="admin-metrics-grid admin-metrics-grid--compact">
        <article className="admin-metric-card">
          <p>Oxunmamış bildirişlər</p>
          <strong>{unreadCount}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Ümumi bildirişlər</p>
          <strong>{notifications.length}</strong>
        </article>
      </section>

      {unreadCount > 0 ? (
        <section className="admin-toolbar-card">
          <div className="admin-toolbar-card__actions">
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleMarkAllRead}
              disabled={actionLoading === "all"}
            >
              {actionLoading === "all" ? "Yenilənir..." : "Hamısını oxundu et"}
            </button>
          </div>
        </section>
      ) : null}

      {loading ? (
        <section className="admin-empty-state">Yüklənir...</section>
      ) : error ? (
        <section className="admin-empty-state admin-empty-state--error">{error}</section>
      ) : notifications.length === 0 ? (
        <section className="admin-empty-state">Bildiriş tapılmadı</section>
      ) : (
        <section className="admin-card-grid admin-card-grid--single">
          {notifications.map((item) => (
            <article
              key={item._id}
              className={`admin-reminder-card${item.isRead ? "" : " admin-reminder-card--unread"}`}
              onClick={() => handleOpenNotification(item)}
            >
              <div className="admin-reminder-card__top">
                <div className="admin-user-cell">
                  <div className="admin-avatar">
                    <i className="fa-regular fa-bell"></i>
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                </div>
                <span className={`admin-status admin-status--${item.isRead ? "neutral" : "warning"}`}>
                  {item.isRead ? "Oxunub" : "Yeni"}
                </span>
              </div>

              <div className="admin-reminder-card__body">
                <div className="admin-reminder-card__highlight">
                  <strong>{item.message}</strong>
                  <span>
                    {item.relatedConversationId?.status === "RESOLVED" ? "Söhbət həll olunub" : "Söhbət aktivdir"}
                  </span>
                </div>
              </div>

              <div className="admin-reminder-card__footer">
                {!item.isRead ? (
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleMarkRead(item._id);
                    }}
                    disabled={actionLoading === item._id}
                  >
                    {actionLoading === item._id ? "Yenilənir..." : "Oxundu et"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </AdminLayout>
  );
}
