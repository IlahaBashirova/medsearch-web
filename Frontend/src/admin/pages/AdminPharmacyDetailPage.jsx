import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getAdminPharmacy } from "../lib/adminApi.js";

function ReadonlyField({ label, value, full = false }) {
  return (
    <label className={`admin-form__field${full ? " admin-form__field--full" : ""}`}>
      <span>{label}</span>
      <input value={value || "—"} readOnly />
    </label>
  );
}

export default function AdminPharmacyDetailPage() {
  const { pharmacyId } = useParams();
  const abortRef = useRef(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;

    async function loadPharmacy() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminPharmacy(pharmacyId, ac.signal);
        setPharmacy(result);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Aptek məlumatını yükləmək mümkün olmadı");
      } finally {
        setLoading(false);
      }
    }

    loadPharmacy();

    return () => ac.abort();
  }, [pharmacyId]);

  return (
    <AdminLayout title="Aptek Məlumatları" subtitle="Aptek məlumatlarına baxış">
      <section className="admin-backline">
        <Link to="/admin/pharmacies" className="admin-backlink">
          <i className="fa-solid fa-arrow-left"></i>
          Geri
        </Link>
      </section>

      <section className="admin-form-card">
        {loading ? (
          <div className="admin-empty-state">Yüklənir...</div>
        ) : error ? (
          <div className="admin-empty-state admin-empty-state--error">{error}</div>
        ) : !pharmacy ? (
          <div className="admin-empty-state">Aptek tapılmadı</div>
        ) : (
          <div className="admin-form">
            <ReadonlyField label="Aptek Adı" value={pharmacy.name} />
            <ReadonlyField label="Status" value={pharmacy.status} />
            <ReadonlyField label="Telefon" value={pharmacy.phone} />
            <ReadonlyField label="Email" value={pharmacy.email} />
            <ReadonlyField label="İş Saatları" value={pharmacy.openingHours} />
            <ReadonlyField label="Sahib" value={pharmacy.ownerId?.name || "Təyin edilməyib"} />
            <ReadonlyField label="Ünvan" value={pharmacy.address} full />
            <ReadonlyField label="Xəritə Linki" value={pharmacy.mapLink} full />
            <label className="admin-form__field admin-form__field--full">
              <span>Qeyd</span>
              <textarea value={pharmacy.notes || "—"} readOnly rows={4} />
            </label>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
