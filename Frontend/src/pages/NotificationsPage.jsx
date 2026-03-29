import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import { getSessionUser } from "../lib/auth.js";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "../lib/notificationsApi.js";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const session = getSessionUser();
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
      const result = await getMyNotifications({ limit: 30 }, ac.signal);
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

  if (session.isAdmin) {
    return <Navigate to="/admin/notifications" replace />;
  }

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
    const pharmacyRef = item.relatedConversationId?.pharmacyRef;

    if (!pharmacyRef) return;

    setActionLoading(item._id);

    try {
      if (!item.isRead) {
        await markNotificationRead(item._id);
      }

      navigate(`/pharmacy/${pharmacyRef}?chat=1`);
    } catch (err) {
      window.alert(err?.message || "Bildiriş açıla bilmədi");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <main className="page page-notifications">
      <div className="page-notifications__container">
        <Topbar
          title="Bildirişlər"
          left={
            <button className="btn-back" type="button" aria-label="Geri" onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          }
          right={
            unreadCount > 0 ? (
              <button
                className="btn btn--primary panel__add"
                type="button"
                onClick={handleMarkAllRead}
                disabled={actionLoading === "all"}
              >
                {actionLoading === "all" ? "Yenilənir..." : "Hamısını oxundu et"}
              </button>
            ) : null
          }
        />

        <section className="user-card">
          <div className="user-card__avatar user-card__avatar--teal" aria-hidden="true">
            <i className="fa-regular fa-bell"></i>
          </div>
          <div className="user-card__info">
            <div className="user-card__name">Bildiriş Mərkəzi</div>
            <div className="user-card__email">
              {unreadCount > 0 ? `${unreadCount} oxunmamış bildiriş var` : "Bütün bildirişlər oxunub"}
            </div>
          </div>
        </section>

        <section className="panel">
          <header className="panel__head panel__head--light">
            <div className="panel__head-left">
              <i className="fa-regular fa-bell"></i>
              <span>Son bildirişlər</span>
            </div>
          </header>

          <div className="panel__body">
            {loading ? (
              <div className="info-box">Yüklənir...</div>
            ) : error ? (
              <div className="info-box">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="info-box">Bildiriş tapılmadı</div>
            ) : (
              <div className="notifications-list">
                {notifications.map((item) => (
                  <article
                    key={item._id}
                    className={`notification-card${item.isRead ? "" : " notification-card--unread"}`}
                    onClick={() => handleOpenNotification(item)}
                  >
                    <div className="notification-card__icon">
                      <i className="fa-regular fa-message"></i>
                    </div>

                    <div className="notification-card__content">
                      <div className="notification-card__top">
                        <strong>{item.title}</strong>
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>
                      <p>{item.message}</p>
                    </div>

                    {!item.isRead ? (
                      <button
                        type="button"
                        className="notification-card__action"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkRead(item._id);
                        }}
                        disabled={actionLoading === item._id}
                      >
                        {actionLoading === item._id ? "Yenilənir..." : "Oxundu et"}
                      </button>
                    ) : (
                      <span className="notification-card__state">Oxunub</span>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
