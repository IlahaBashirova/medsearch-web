import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getAdminMedicine } from "../lib/adminApi.js";

function ReadonlyField({ label, value, full = false }) {
  return (
    <label className={`admin-form__field${full ? " admin-form__field--full" : ""}`}>
      <span>{label}</span>
      <input value={value || "—"} readOnly />
    </label>
  );
}

export default function AdminMedicineDetailPage() {
  const { medicineId } = useParams();
  const abortRef = useRef(null);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;

    async function loadMedicine() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminMedicine(medicineId, ac.signal);
        setMedicine(result);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Dərman məlumatını yükləmək mümkün olmadı");
      } finally {
        setLoading(false);
      }
    }

    loadMedicine();

    return () => ac.abort();
  }, [medicineId]);

  return (
    <AdminLayout title="Dərman Məlumatları" subtitle="Dərman məlumatlarına baxış">
      <section className="admin-backline">
        <Link to="/admin/medicines" className="admin-backlink">
          <i className="fa-solid fa-arrow-left"></i>
          Geri
        </Link>
      </section>

      <section className="admin-form-card">
        {loading ? (
          <div className="admin-empty-state">Yüklənir...</div>
        ) : error ? (
          <div className="admin-empty-state admin-empty-state--error">{error}</div>
        ) : !medicine ? (
          <div className="admin-empty-state">Dərman tapılmadı</div>
        ) : (
          <div className="admin-form">
            <ReadonlyField label="Dərman Adı" value={medicine.name} />
            <ReadonlyField label="Kateqoriya" value={medicine.category} />
            <ReadonlyField label="Aptek" value={medicine.pharmacyId?.name} />
            <ReadonlyField label="İstehsalçı" value={medicine.manufacturer} />
            <ReadonlyField label="Dozaj Forması" value={medicine.dosageForm} />
            <ReadonlyField label="Güc" value={medicine.strength} />
            <ReadonlyField
              label="Qiymət"
              value={medicine.price !== undefined ? `${Number(medicine.price).toFixed(2)} ₼` : "—"}
            />
            <ReadonlyField label="Stok" value={medicine.stock !== undefined ? String(medicine.stock) : "—"} />
            <ReadonlyField label="Resept" value={medicine.requiresPrescription ? "Tələb olunur" : "Tələb olunmur"} />
            <ReadonlyField label="Status" value={medicine.isActive ? "Aktiv" : "Passiv"} />
            <label className="admin-form__field admin-form__field--full">
              <span>Təsvir</span>
              <textarea value={medicine.description || "—"} readOnly rows={4} />
            </label>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
