import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getAdminReservations, updateAdminReservationStatus } from "../lib/adminApi.js";

function normalizeStatusLabel(status) {
  if (status === "PENDING") return "Gözləyir";
  if (status === "ACTIVE") return "Aktiv";
  if (status === "COMPLETED") return "Təsdiqləndi";
  if (status === "CANCELLED") return "Ləğv edilib";
  return status || "—";
}

function ReservationStatusBadge({ status }) {
  const tone =
    status === "COMPLETED" ? "success" : status === "CANCELLED" ? "danger" : status === "PENDING" ? "warning" : "neutral";

  return <span className={`admin-status admin-status--${tone}`}>{normalizeStatusLabel(status)}</span>;
}

export default function AdminReservationsPage() {
  const abortRef = useRef(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [reservations, setReservations] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadReservations = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [listRes, totalRes, pendingRes, completedRes, cancelledRes] = await Promise.all([
        getAdminReservations({ status, limit: 20 }, ac.signal),
        getAdminReservations({ limit: 1 }, ac.signal),
        getAdminReservations({ status: "PENDING", limit: 1 }, ac.signal),
        getAdminReservations({ status: "COMPLETED", limit: 1 }, ac.signal),
        getAdminReservations({ status: "CANCELLED", limit: 1 }, ac.signal)
      ]);

      const data = Array.isArray(listRes?.data) ? listRes.data : [];
      const filtered = search
        ? data.filter((item) =>
            [item.userId?.name, item.userId?.email, item.pharmacyName, item.medicineName]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(search.toLowerCase()))
          )
        : data;

      setReservations(filtered);
      setSummary({
        total: totalRes?.total || 0,
        pending: pendingRes?.total || 0,
        completed: completedRes?.total || 0,
        cancelled: cancelledRes?.total || 0
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Rezervasiyaları yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    loadReservations();
    return () => abortRef.current?.abort();
  }, [loadReservations]);

  async function handleStatusChange(item, nextStatus) {
    setActionLoading(item._id);

    try {
      await updateAdminReservationStatus(item._id, { status: nextStatus });
      await loadReservations();
    } catch (err) {
      window.alert(err?.message || "Rezervasiya yenilənmədi");
    } finally {
      setActionLoading("");
    }
  }

  const rows = useMemo(() => reservations, [reservations]);

  return (
    <AdminLayout title="Rezervasiya idarəetməsi" subtitle="Bütün dərman rezervasiyalarını idarə edin">
      <section className="admin-metrics-grid admin-metrics-grid--pharmacies">
        <article className="admin-metric-card">
          <p>Ümumi rezervasiyalar</p>
          <strong>{summary.total}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Gözləyən</p>
          <strong className="admin-figure admin-figure--warning">{summary.pending}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Təsdiqlənmiş</p>
          <strong className="admin-figure admin-figure--success">{summary.completed}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Ləğv edilmiş</p>
          <strong className="admin-figure admin-figure--danger">{summary.cancelled}</strong>
        </article>
      </section>

      <section className="admin-toolbar-card">
        <label className="admin-search admin-search--wide">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Rezervasiya axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="admin-toolbar-card__actions">
          <label className="admin-select">
            <i className="fa-solid fa-filter" aria-hidden="true"></i>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Hamısı</option>
              <option value="PENDING">Gözləyən</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="COMPLETED">Təsdiqlənmiş</option>
              <option value="CANCELLED">Ləğv edilmiş</option>
            </select>
          </label>
        </div>
      </section>

      <section className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">Yüklənir...</div>
        ) : error ? (
          <div className="admin-empty-state admin-empty-state--error">{error}</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty-state">Rezervasiya tapılmadı</div>
        ) : (
          <div className="admin-table admin-table--reservations">
            <div className="admin-table__head">
              <span>İstifadəçi</span>
              <span>Aptek</span>
              <span>Dərman</span>
              <span>Tarix / Vaxt</span>
              <span>Qiymət</span>
              <span>Status</span>
              <span>Əməliyyatlar</span>
            </div>

            {rows.map((item) => (
              <div key={item._id} className="admin-table__row">
                <div>
                  <strong>{item.userId?.name || "—"}</strong>
                  <span className="admin-subtext">{item.userId?.email || "—"}</span>
                </div>

                <span>{item.pharmacyId?.name || item.pharmacyName || "—"}</span>

                <div>
                  <strong>{item.medicineName || "—"}</strong>
                  <span className="admin-subtext">Say: {item.quantity ?? 0}</span>
                </div>

                <div>
                  <strong>{new Date(item.createdAt).toLocaleDateString("az-AZ")}</strong>
                  <span className="admin-subtext">
                    {new Date(item.createdAt).toLocaleTimeString("az-AZ", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                <span>{Number(item.price || 0).toFixed(2)} ₼</span>
                <ReservationStatusBadge status={item.status} />

                <div className="admin-row-actions admin-row-actions--wide">
                  {item.status !== "COMPLETED" ? (
                    <button
                      type="button"
                      title="Təsdiqlə"
                      onClick={() => handleStatusChange(item, "COMPLETED")}
                      disabled={actionLoading === item._id}
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  ) : (
                    <span className="admin-row-actions__placeholder">—</span>
                  )}

                  {item.status !== "CANCELLED" ? (
                    <button
                      type="button"
                      title="Ləğv et"
                      onClick={() => handleStatusChange(item, "CANCELLED")}
                      disabled={actionLoading === item._id}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  ) : (
                    <span className="admin-row-actions__placeholder">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
