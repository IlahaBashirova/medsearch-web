import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import { createAdminMedicine, getAdminMedicines, getAdminPharmacies, updateAdminMedicine } from "../lib/adminApi.js";

function MedicineStatus({ item }) {
  const tone = item.isActive ? "success" : "danger";
  return <span className={`admin-status admin-status--${tone}`}>{item.isActive ? "Aktiv" : "Passiv"}</span>;
}

export default function AdminMedicinesPage() {
  const abortRef = useRef(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [pharmacyOptions, setPharmacyOptions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadMedicines = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [listRes, totalRes, activeRes, inactiveRes, pharmaciesRes] = await Promise.all([
        getAdminMedicines(
          {
            search,
            isActive: activeFilter === "" ? undefined : activeFilter,
            limit: 20
          },
          ac.signal
        ),
        getAdminMedicines({ limit: 1 }, ac.signal),
        getAdminMedicines({ isActive: "true", limit: 1 }, ac.signal),
        getAdminMedicines({ isActive: "false", limit: 1 }, ac.signal),
        getAdminPharmacies({ limit: 100 }, ac.signal)
      ]);

      setMedicines(Array.isArray(listRes?.data) ? listRes.data : []);
      setPharmacyOptions(Array.isArray(pharmaciesRes?.data) ? pharmaciesRes.data : []);
      setSummary({
        total: totalRes?.total || 0,
        active: activeRes?.total || 0,
        inactive: inactiveRes?.total || 0
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Dərmanları yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    loadMedicines();
    return () => abortRef.current?.abort();
  }, [loadMedicines]);

  const fallbackPharmacyId = pharmacyOptions[0]?._id || "";

  async function handleQuickAdd() {
    if (!fallbackPharmacyId) {
      window.alert("Əvvəlcə ən azı bir aptek olmalıdır");
      return;
    }

    setActionLoading("create");

    try {
      await createAdminMedicine({
        name: `Yeni Dərman ${Date.now().toString().slice(-4)}`,
        category: "Digər",
        description: "Admin panelindən əlavə edildi",
        manufacturer: "MedSearch",
        dosageForm: "Tablet",
        strength: "100mg",
        price: 5,
        stock: 20,
        pharmacyId: fallbackPharmacyId,
        requiresPrescription: false,
        isActive: true
      });
      await loadMedicines();
    } catch (err) {
      window.alert(err?.message || "Dərman əlavə olunmadı");
    } finally {
      setActionLoading("");
    }
  }

  async function handleToggleMedicine(item) {
    setActionLoading(item._id);

    try {
      await updateAdminMedicine(item._id, { isActive: !item.isActive });
      await loadMedicines();
    } catch (err) {
      window.alert(err?.message || "Dərman yenilənmədi");
    } finally {
      setActionLoading("");
    }
  }

  const rows = useMemo(() => medicines, [medicines]);

  return (
    <AdminLayout title="Dərman idarəetməsi" subtitle="Sistemdəki dərmanları izləyin və idarə edin">
      <section className="admin-metrics-grid admin-metrics-grid--compact">
        <article className="admin-metric-card">
          <p>Ümumi dərmanlar</p>
          <strong>{summary.total}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Aktiv dərmanlar</p>
          <strong className="admin-figure admin-figure--success">{summary.active}</strong>
        </article>
        <article className="admin-metric-card">
          <p>Passiv dərmanlar</p>
          <strong className="admin-figure admin-figure--danger">{summary.inactive}</strong>
        </article>
      </section>

      <section className="admin-toolbar-card">
        <label className="admin-search admin-search--wide">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Dərman axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="admin-toolbar-card__actions">
          <label className="admin-select">
            <i className="fa-solid fa-filter" aria-hidden="true"></i>
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              <option value="">Hamısı</option>
              <option value="true">Aktiv</option>
              <option value="false">Passiv</option>
            </select>
          </label>

          <button type="button" className="admin-primary-btn" onClick={handleQuickAdd} disabled={actionLoading === "create"}>
            <i className="fa-solid fa-plus"></i>
            {actionLoading === "create" ? "Əlavə edilir..." : "Yeni dərman"}
          </button>
        </div>
      </section>

      <section className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">Yüklənir...</div>
        ) : error ? (
          <div className="admin-empty-state admin-empty-state--error">{error}</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty-state">Dərman tapılmadı</div>
        ) : (
          <div className="admin-table admin-table--medicines">
            <div className="admin-table__head">
              <span>Dərman</span>
              <span>Kateqoriya</span>
              <span>Aptek</span>
              <span>Qiymət</span>
              <span>Stok</span>
              <span>Status</span>
              <span>Əməliyyatlar</span>
            </div>

            {rows.map((item) => (
              <div key={item._id} className="admin-table__row">
                <div>
                  <strong>{item.name}</strong>
                  <span className="admin-subtext">{item.strength || item.dosageForm || "—"}</span>
                </div>
                <span>{item.category || "—"}</span>
                <span>{item.pharmacyId?.name || "—"}</span>
                <span>{Number(item.price || 0).toFixed(2)} ₼</span>
                <span>{item.stock ?? 0}</span>
                <MedicineStatus item={item} />

                <div className="admin-row-actions">
                  <button type="button" title="Bax">
                    <i className="fa-regular fa-eye"></i>
                  </button>
                  <button
                    type="button"
                    title={item.isActive ? "Passiv et" : "Aktiv et"}
                    onClick={() => handleToggleMedicine(item)}
                    disabled={actionLoading === item._id}
                  >
                    <i className={item.isActive ? "fa-solid fa-ban" : "fa-solid fa-check"}></i>
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
