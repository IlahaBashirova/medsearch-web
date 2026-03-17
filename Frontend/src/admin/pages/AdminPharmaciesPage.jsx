import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getAdminPharmacies } from "../lib/adminApi.js";

function PharmacyStatusBadge({ status }) {
  const tone =
    status === "ACTIVE" ? "success" : status === "PENDING" ? "warning" : "danger";
  const label =
    status === "ACTIVE" ? "Aktiv" : status === "PENDING" ? "Gözləyir" : "Passiv";

  return <span className={`admin-status admin-status--${tone}`}>{label}</span>;
}

export default function AdminPharmaciesPage() {
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const [search, setSearch] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, pending: 0, pageCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPharmacies = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [listRes, totalRes, activeRes, pendingRes] = await Promise.all([
        getAdminPharmacies({ search, limit: 12 }, ac.signal),
        getAdminPharmacies({ limit: 1 }, ac.signal),
        getAdminPharmacies({ status: "ACTIVE", limit: 1 }, ac.signal),
        getAdminPharmacies({ status: "PENDING", limit: 1 }, ac.signal)
      ]);

      const data = Array.isArray(listRes?.data) ? listRes.data : [];

      setPharmacies(data);
      setSummary({
        total: totalRes?.total || 0,
        active: activeRes?.total || 0,
        pending: pendingRes?.total || 0,
        pageCount: data.length
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Aptekləri yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadPharmacies();
    return () => abortRef.current?.abort();
  }, [loadPharmacies]);

  return (
    <AdminLayout title="Aptek idarəetməsi" subtitle="Sistemdəki bütün aptekləri idarə edin">
      <section className="admin-metrics-grid admin-metrics-grid--compact admin-metrics-grid--pharmacies">
        <article className="admin-metric-card">
          <p>Ümumi apteklər</p>
          <strong>{summary.total}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Aktiv apteklər</p>
          <strong className="admin-figure admin-figure--success">{summary.active}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Gözləyən apteklər</p>
          <strong className="admin-figure admin-figure--warning">{summary.pending}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Bu səhifədə</p>
          <strong className="admin-figure admin-figure--blue">{summary.pageCount}</strong>
        </article>
      </section>

      <section className="admin-toolbar-card">
        <label className="admin-search admin-search--wide">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Aptek axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="admin-toolbar-card__actions">
          <button type="button" className="admin-primary-btn" onClick={() => navigate("/admin/pharmacies/new")}>
            <i className="fa-solid fa-plus"></i>
            Yeni Aptek Əlavə Et
          </button>
        </div>
      </section>

      {loading ? (
        <section className="admin-empty-state">Yüklənir...</section>
      ) : error ? (
        <section className="admin-empty-state admin-empty-state--error">{error}</section>
      ) : pharmacies.length === 0 ? (
        <section className="admin-empty-state">Aptek tapılmadı</section>
      ) : (
        <section className="admin-card-grid">
          {pharmacies.map((pharmacy) => (
            <article key={pharmacy._id} className="admin-pharmacy-card">
              <div className="admin-pharmacy-card__top">
                <div>
                  <h3>{pharmacy.name}</h3>
                  <PharmacyStatusBadge status={pharmacy.status} />
                </div>

                <div className="admin-row-actions">
                  <button type="button" title="Bax">
                    <i className="fa-regular fa-eye"></i>
                  </button>
                  <button type="button" title="Düzəliş mümkün deyil">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>
              </div>

              <div className="admin-pharmacy-card__meta">
                <p>
                  <i className="fa-solid fa-location-dot"></i>
                  <span>{pharmacy.address || "Ünvan yoxdur"}</span>
                </p>
                <p>
                  <i className="fa-solid fa-phone"></i>
                  <span>{pharmacy.phone || "Telefon yoxdur"}</span>
                </p>
                <p>
                  <i className="fa-regular fa-clock"></i>
                  <span>{pharmacy.openingHours || "İş saatı göstərilməyib"}</span>
                </p>
              </div>

              <div className="admin-pharmacy-card__footer">
                <div>
                  <span>Sahib</span>
                  <strong>{pharmacy.ownerId?.name || "Təyin edilməyib"}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{pharmacy.email || "—"}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </AdminLayout>
  );
}
