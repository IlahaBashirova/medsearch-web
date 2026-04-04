import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { getAdminUser } from "../lib/adminApi.js";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("az-AZ");
}

function ReadonlyField({ label, value, full = false }) {
  return (
    <label className={`admin-form__field${full ? " admin-form__field--full" : ""}`}>
      <span>{label}</span>
      <input value={value || "—"} readOnly />
    </label>
  );
}

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const abortRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;

    async function loadUser() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminUser(userId, ac.signal);
        setUser(result);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "İstifadəçi məlumatını yükləmək mümkün olmadı");
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    return () => ac.abort();
  }, [userId]);

  return (
    <AdminLayout title="İstifadəçi Məlumatları" subtitle="İstifadəçi məlumatlarına baxış">
      <section className="admin-backline">
        <Link to="/admin/users" className="admin-backlink">
          <i className="fa-solid fa-arrow-left"></i>
          Geri
        </Link>
      </section>

      <section className="admin-form-card">
        {loading ? (
          <div className="admin-empty-state">Yüklənir...</div>
        ) : error ? (
          <div className="admin-empty-state admin-empty-state--error">{error}</div>
        ) : !user ? (
          <div className="admin-empty-state">İstifadəçi tapılmadı</div>
        ) : (
          <div className="admin-form">
            <ReadonlyField label="Ad" value={user.name} />
            <ReadonlyField label="Email" value={user.email} />
            <ReadonlyField label="Rol" value={user.role} />
            <ReadonlyField label="Status" value={user.status} />
            <ReadonlyField label="Telefon" value={user.phone} />
            <ReadonlyField label="Qeydiyyat tarixi" value={formatDateTime(user.createdAt)} />
            <ReadonlyField label="Son giriş" value={formatDateTime(user.lastLoginAt)} full />
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
