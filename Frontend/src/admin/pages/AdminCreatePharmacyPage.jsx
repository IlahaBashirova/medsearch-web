import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { createAdminPharmacy } from "../lib/adminApi.js";

const initialForm = {
  name: "",
  address: "",
  phone: "",
  openingHours: "09:00 - 22:00",
  email: "",
  mapLink: "",
  status: "ACTIVE",
  notes: ""
};

export default function AdminCreatePharmacyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createAdminPharmacy(form);
      setSuccess("Yeni aptek uğurla əlavə edildi");
      setTimeout(() => navigate("/admin/pharmacies", { replace: true }), 800);
    } catch (err) {
      setError(err?.message || "Aptek əlavə etmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Yeni Aptek Əlavə Et" subtitle="Yeni aptek əlavə edin">
      <section className="admin-backline">
        <Link to="/admin/pharmacies" className="admin-backlink">
          <i className="fa-solid fa-arrow-left"></i>
          Geri
        </Link>
      </section>

      <section className="admin-form-card">
        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-form__field admin-form__field--full">
            <span>Aptek Adı *</span>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Məsələn: Təbib Apteki"
              required
            />
          </label>

          <label className="admin-form__field admin-form__field--full">
            <span>Ünvan *</span>
            <input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Məsələn: Nizami küçəsi 15, Bakı"
              required
            />
          </label>

          <label className="admin-form__field admin-form__field--full">
            <span>Telefon *</span>
            <input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+994 12 555 11 22"
              required
            />
          </label>

          <label className="admin-form__field admin-form__field--full">
            <span>İş Saatları *</span>
            <input
              value={form.openingHours}
              onChange={(e) => updateField("openingHours", e.target.value)}
              placeholder="09:00 - 22:00"
              required
            />
          </label>

          <label className="admin-form__field">
            <span>Email</span>
            <input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="aptekin emaili"
              type="email"
            />
          </label>

          <label className="admin-form__field">
            <span>Status</span>
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
              <option value="ACTIVE">Aktiv</option>
              <option value="PENDING">Gözləyir</option>
              <option value="INACTIVE">Passiv</option>
            </select>
          </label>

          <label className="admin-form__field admin-form__field--full">
            <span>Xəritə Linki</span>
            <input
              value={form.mapLink}
              onChange={(e) => updateField("mapLink", e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </label>

          <label className="admin-form__field admin-form__field--full">
            <span>Qeyd</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Əlavə məlumat..."
              rows={4}
            />
          </label>

          {error ? <div className="admin-form__message admin-form__message--error">{error}</div> : null}
          {success ? <div className="admin-form__message admin-form__message--success">{success}</div> : null}

          <div className="admin-form__footer">
            <Link to="/admin/pharmacies" className="admin-secondary-btn">
              Ləğv et
            </Link>
            <button type="submit" className="admin-primary-btn" disabled={loading}>
              <i className="fa-regular fa-floppy-disk"></i>
              {loading ? "Əlavə edilir..." : "Əlavə Et"}
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
}
