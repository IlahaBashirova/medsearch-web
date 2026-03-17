import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getAdminUsers, updateAdminUser } from "../lib/adminApi.js";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("az-AZ");
}

function StatusBadge({ status }) {
  const tone =
    status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "danger" : "warning";
  const label =
    status === "ACTIVE" ? "Aktiv" : status === "SUSPENDED" ? "Bloklanıb" : "Passiv";

  return <span className={`admin-status admin-status--${tone}`}>{label}</span>;
}

export default function AdminUsersPage() {
  const abortRef = useRef(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, blocked: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadUsers = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [listRes, totalRes, activeRes, blockedRes] = await Promise.all([
        getAdminUsers({ search, status, limit: 20 }, ac.signal),
        getAdminUsers({ limit: 1 }, ac.signal),
        getAdminUsers({ status: "ACTIVE", limit: 1 }, ac.signal),
        getAdminUsers({ status: "SUSPENDED", limit: 1 }, ac.signal)
      ]);

      setUsers(Array.isArray(listRes?.data) ? listRes.data : []);
      setSummary({
        total: totalRes?.total || 0,
        active: activeRes?.total || 0,
        blocked: blockedRes?.total || 0
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "İstifadəçiləri yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    loadUsers();
    return () => abortRef.current?.abort();
  }, [loadUsers]);

  const tableRows = useMemo(() => users, [users]);

  async function handleToggleStatus(user) {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdatingId(user._id);

    try {
      await updateAdminUser(user._id, { status: nextStatus });
      await loadUsers();
    } catch (err) {
      window.alert(err?.message || "Status yenilənmədi");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <AdminLayout title="İstifadəçi idarəetməsi" subtitle="Bütün qeydiyyatlı istifadəçiləri idarə edin">
      <section className="admin-metrics-grid admin-metrics-grid--compact">
        <article className="admin-metric-card">
          <p>Ümumi istifadəçilər</p>
          <strong>{summary.total}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Aktiv istifadəçilər</p>
          <strong className="admin-figure admin-figure--success">{summary.active}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Bloklanan istifadəçilər</p>
          <strong className="admin-figure admin-figure--danger">{summary.blocked}</strong>
        </article>
      </section>

      <section className="admin-toolbar-card">
        <label className="admin-search admin-search--wide">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="İstifadəçi axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="admin-toolbar-card__actions">
          <label className="admin-select">
            <i className="fa-solid fa-filter" aria-hidden="true"></i>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Hamısı</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="INACTIVE">Passiv</option>
              <option value="SUSPENDED">Bloklanıb</option>
            </select>
          </label>
        </div>
      </section>

      <section className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">Yüklənir...</div>
        ) : error ? (
          <div className="admin-empty-state admin-empty-state--error">{error}</div>
        ) : tableRows.length === 0 ? (
          <div className="admin-empty-state">İstifadəçi tapılmadı</div>
        ) : (
          <div className="admin-table">
            <div className="admin-table__head">
              <span>İstifadəçi</span>
              <span>Email</span>
              <span>Qeydiyyat tarixi</span>
              <span>Status</span>
              <span>Rezervasiyalar</span>
              <span>Əməliyyatlar</span>
            </div>

            {tableRows.map((user) => (
              <div key={user._id} className="admin-table__row">
                <div className="admin-user-cell">
                  <div className="admin-avatar">{user.name?.slice(0, 1) || "U"}</div>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.role === "ADMIN" ? "Admin" : "İstifadəçi"}</span>
                  </div>
                </div>

                <span>{user.email}</span>
                <span>{formatDate(user.createdAt)}</span>
                <StatusBadge status={user.status} />
                <span>{user.reservationCount ?? "—"}</span>

                <div className="admin-row-actions">
                  <button type="button" title="Bax">
                    <i className="fa-regular fa-eye"></i>
                  </button>
                  <button
                    type="button"
                    title={user.status === "ACTIVE" ? "Blokla" : "Aktiv et"}
                    onClick={() => handleToggleStatus(user)}
                    disabled={updatingId === user._id}
                  >
                    <i className={user.status === "ACTIVE" ? "fa-solid fa-ban" : "fa-solid fa-check"}></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
