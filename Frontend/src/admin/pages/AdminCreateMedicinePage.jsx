import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { createAdminMedicine, getAdminMedicines, getAdminPharmacies } from "../lib/adminApi.js";

const defaultCategories = ["Antibiotic", "Pain Relief", "Supplements", "Digər"];

const initialForm = {
  name: "",
  category: defaultCategories[0],
  description: "",
  manufacturer: "",
  dosageForm: "",
  strength: "",
  price: "",
  stock: "",
  pharmacyId: "",
  requiresPrescription: false,
  isActive: true
};

function ToggleField({ label, hint, checked, onChange }) {
  return (
    <label className="admin-toggle-row">
      <div>
        <strong>{label}</strong>
        {hint ? <span>{hint}</span> : null}
      </div>
      <span className={`admin-switch${checked ? " admin-switch--active" : ""}`}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span />
      </span>
    </label>
  );
}

export default function AdminCreateMedicinePage() {
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [pharmacyOptions, setPharmacyOptions] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;

    async function loadOptions() {
      setPageLoading(true);
      setError("");

      try {
        const [pharmaciesRes, medicinesRes] = await Promise.all([
          getAdminPharmacies({ limit: 100 }, ac.signal),
          getAdminMedicines({ limit: 100 }, ac.signal)
        ]);

        const pharmacies = Array.isArray(pharmaciesRes?.data) ? pharmaciesRes.data : [];
        const medicines = Array.isArray(medicinesRes?.data) ? medicinesRes.data : [];
        const categories = medicines
          .map((item) => item?.category?.trim())
          .filter(Boolean);

        setPharmacyOptions(pharmacies);
        setDynamicCategories(categories);
        setForm((prev) => ({
          ...prev,
          pharmacyId: prev.pharmacyId || pharmacies[0]?._id || ""
        }));
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Məlumatları yükləmək mümkün olmadı");
      } finally {
        setPageLoading(false);
      }
    }

    loadOptions();

    return () => ac.abort();
  }, []);

  const categoryOptions = useMemo(
    () => Array.from(new Set([...defaultCategories, ...dynamicCategories])),
    [dynamicCategories]
  );

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createAdminMedicine({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        manufacturer: form.manufacturer.trim(),
        dosageForm: form.dosageForm.trim(),
        strength: form.strength.trim(),
        price: form.price === "" ? 0 : Number(form.price),
        stock: form.stock === "" ? 0 : Number(form.stock),
        pharmacyId: form.pharmacyId,
        requiresPrescription: form.requiresPrescription,
        isActive: form.isActive
      });
      setSuccess("Yeni dərman uğurla əlavə edildi");
      setTimeout(() => navigate("/admin/medicines", { replace: true }), 800);
    } catch (err) {
      setError(err?.message || "Dərman əlavə etmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Yeni Dərman Əlavə Et" subtitle="Yeni dərman əlavə edin">
      <section className="admin-backline">
        <Link to="/admin/medicines" className="admin-backlink">
          <i className="fa-solid fa-arrow-left"></i>
          Geri
        </Link>
      </section>

      <section className="admin-form-card">
        {pageLoading ? (
          <div className="admin-empty-state">Yüklənir...</div>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="admin-form__field admin-form__field--full">
              <span>Dərman Adı *</span>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Məsələn: Ibuprofen 200mg"
                required
              />
            </label>

            <label className="admin-form__field">
              <span>Kateqoriya *</span>
              <select value={form.category} onChange={(e) => updateField("category", e.target.value)} required>
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form__field">
              <span>Aptek *</span>
              <select value={form.pharmacyId} onChange={(e) => updateField("pharmacyId", e.target.value)} required>
                <option value="" disabled>
                  Aptek seçin
                </option>
                {pharmacyOptions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form__field admin-form__field--full">
              <span>Təsvir</span>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Dərman haqqında qısa məlumat..."
                rows={4}
              />
            </label>

            <label className="admin-form__field">
              <span>İstehsalçı</span>
              <input
                value={form.manufacturer}
                onChange={(e) => updateField("manufacturer", e.target.value)}
                placeholder="Məsələn: Abbott"
              />
            </label>

            <label className="admin-form__field">
              <span>Dozaj Forması</span>
              <input
                value={form.dosageForm}
                onChange={(e) => updateField("dosageForm", e.target.value)}
                placeholder="Məsələn: Tablet"
              />
            </label>

            <label className="admin-form__field">
              <span>Güc</span>
              <input
                value={form.strength}
                onChange={(e) => updateField("strength", e.target.value)}
                placeholder="Məsələn: 200mg"
              />
            </label>

            <label className="admin-form__field">
              <span>Qiymət</span>
              <input
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
              />
            </label>

            <label className="admin-form__field">
              <span>Stok</span>
              <input
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                placeholder="0"
                type="number"
                min="0"
                step="1"
              />
            </label>

            <div className="admin-form__field admin-form__field--full">
              <ToggleField
                label="Resept tələb olunur"
                hint="Bu dərman yalnız reseptlə satılırsa aktiv edin"
                checked={form.requiresPrescription}
                onChange={(value) => updateField("requiresPrescription", value)}
              />
            </div>

            <div className="admin-form__field admin-form__field--full">
              <ToggleField
                label="Aktiv status"
                hint="Dərman siyahıda aktiv görünsün"
                checked={form.isActive}
                onChange={(value) => updateField("isActive", value)}
              />
            </div>

            {error ? <div className="admin-form__message admin-form__message--error">{error}</div> : null}
            {success ? <div className="admin-form__message admin-form__message--success">{success}</div> : null}

            <div className="admin-form__footer">
              <Link to="/admin/medicines" className="admin-secondary-btn">
                Ləğv et
              </Link>
              <button
                type="submit"
                className="admin-primary-btn"
                disabled={loading || pharmacyOptions.length === 0}
              >
                <i className="fa-regular fa-floppy-disk"></i>
                {loading ? "Əlavə edilir..." : "Əlavə Et"}
              </button>
            </div>
          </form>
        )}
      </section>
    </AdminLayout>
  );
}
