import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getAdminReminders, updateAdminReminder } from "../lib/adminApi.js";

function ReminderStatus({ enabled }) {
  return (
    <span className={`admin-status admin-status--${enabled ? "success" : "danger"}`}>
      {enabled ? "Aktiv" : "Deaktiv"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("az-AZ");
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminRemindersPage() {
  const abortRef = useRef(null);
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState("");
  const [reminders, setReminders] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadReminders = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [listRes, totalRes, activeRes, inactiveRes] = await Promise.all([
        getAdminReminders(
          {
            enabled: enabled === "" ? undefined : enabled,
            limit: 20
          },
          ac.signal
        ),
        getAdminReminders({ limit: 1 }, ac.signal),
        getAdminReminders({ enabled: "true", limit: 1 }, ac.signal),
        getAdminReminders({ enabled: "false", limit: 1 }, ac.signal)
      ]);

      const data = Array.isArray(listRes?.data) ? listRes.data : [];
      const filtered = search
        ? data.filter((item) =>
            [item.userId?.name, item.userId?.email, item.title, item.medicineId?.name, item.dose]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(search.toLowerCase()))
          )
        : data;

      setReminders(filtered);
      setSummary({
        total: totalRes?.total || 0,
        active: activeRes?.total || 0,
        inactive: inactiveRes?.total || 0
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Xatırlatmaları yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, [enabled, search]);

  useEffect(() => {
    loadReminders();
    return () => abortRef.current?.abort();
  }, [loadReminders]);

  const cards = useMemo(() => reminders, [reminders]);

  async function handleToggleReminder(item) {
    setActionLoading(item._id);

    try {
      await updateAdminReminder(item._id, { isEnabled: !item.isEnabled });
      await loadReminders();
    } catch (err) {
      window.alert(err?.message || "Xatırlatma yenilənmədi");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <AdminLayout title="Dərman Xatırlatmaları" subtitle="İstifadəçilər tərəfindən yaradılan xatırlatmaları izləyin">
      <section className="admin-metrics-grid admin-metrics-grid--compact">
        <article className="admin-metric-card">
          <p>Ümumi xatırlatmalar</p>
          <strong>{summary.total}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Aktiv xatırlatmalar</p>
          <strong className="admin-figure admin-figure--success">{summary.active}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Deaktiv xatırlatmalar</p>
          <strong className="admin-figure admin-figure--danger">{summary.inactive}</strong>
        </article>
      </section>

      <section className="admin-toolbar-card">
        <label className="admin-search admin-search--wide">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Xatırlatma axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="admin-toolbar-card__actions">
          <label className="admin-select">
            <i className="fa-solid fa-filter" aria-hidden="true"></i>
            <select value={enabled} onChange={(e) => setEnabled(e.target.value)}>
              <option value="">Hamısı</option>
              <option value="true">Aktiv</option>
              <option value="false">Deaktiv</option>
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <section className="admin-empty-state">Yüklənir...</section>
      ) : error ? (
        <section className="admin-empty-state admin-empty-state--error">{error}</section>
      ) : cards.length === 0 ? (
        <section className="admin-empty-state">Xatırlatma tapılmadı</section>
      ) : (
        <section className="admin-card-grid">
          {cards.map((item) => (
            <article key={item._id} className="admin-reminder-card">
              <div className="admin-reminder-card__top">
                <div className="admin-user-cell">
                  <div className="admin-avatar">{item.userId?.name?.slice(0, 1) || "U"}</div>
                  <div>
                    <strong>{item.userId?.name || "İstifadəçi"}</strong>
                    <span>{item.userId?.email || "—"}</span>
                  </div>
                </div>
                <ReminderStatus enabled={item.isEnabled} />
              </div>

              <div className="admin-reminder-card__body">
                <div className="admin-reminder-card__highlight">
                  <strong>{item.medicineId?.name || item.title}</strong>
                  <span>Doza: {item.dose || "—"}</span>
                  <span>Başlıq: {item.title}</span>
                </div>

                <div className="admin-reminder-card__meta">
                  <p>
                    <i className="fa-regular fa-clock"></i>
                    <span>
                      Saat: {formatTime(item.scheduledAt)} | Tarix: {formatDate(item.scheduledAt)}
                    </span>
                  </p>
                  <p>
                    <i className="fa-regular fa-bell"></i>
                    <span>Kanal: {item.channel}</span>
                  </p>
                </div>
              </div>

              <div className="admin-reminder-card__footer">
                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={() => handleToggleReminder(item)}
                  disabled={actionLoading === item._id}
                >
                  {actionLoading === item._id
                    ? "Yenilənir..."
                    : item.isEnabled
                      ? "Deaktiv et"
                      : "Aktiv et"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </AdminLayout>
  );
}
