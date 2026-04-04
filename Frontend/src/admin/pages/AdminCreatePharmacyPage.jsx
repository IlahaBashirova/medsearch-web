import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import { createAdminMedicine, createAdminPharmacy, getAdminPharmacy, updateAdminPharmacy } from "../lib/adminApi.js";

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

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function normalizeMedicineRecord(record) {
  const name = String(record?.name || "").trim();

  if (!name) {
    throw new Error("Dərman faylında hər sətirdə `name` sahəsi olmalıdır.");
  }

  return {
    name,
    category: String(record?.category || "").trim(),
    description: String(record?.description || "").trim(),
    manufacturer: String(record?.manufacturer || "").trim(),
    dosageForm: String(record?.dosageForm || "").trim(),
    strength: String(record?.strength || "").trim(),
    price: parseNumber(record?.price),
    stock: parseNumber(record?.stock),
    requiresPrescription: parseBoolean(record?.requiresPrescription),
    isActive: record?.isActive === undefined ? true : parseBoolean(record?.isActive)
  };
}

async function parseMedicinesFile(file) {
  const ext = file.name.toLowerCase().split(".").pop();
  const raw = await file.text();

  if (ext === "json") {
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("JSON faylı oxunmadı. Düzgün JSON formatı istifadə edin.");
    }

    if (!Array.isArray(parsed)) {
      throw new Error("JSON faylı massiv formatında olmalıdır.");
    }

    return parsed.map(normalizeMedicineRecord);
  }

  if (ext === "csv") {
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV faylında başlıq və ən azı bir dərman sətri olmalıdır.");
    }

    const headers = splitCsvLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = splitCsvLine(line);
      const item = {};

      headers.forEach((header, index) => {
        item[header] = values[index] ?? "";
      });

      return item;
    });

    return rows.map(normalizeMedicineRecord);
  }

  throw new Error("Yalnız JSON və ya CSV formatında dərman faylı yükləyə bilərsiniz.");
}

export default function AdminCreatePharmacyPage() {
  const { pharmacyId } = useParams();
  const isEditMode = Boolean(pharmacyId);
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [medicinesFile, setMedicinesFile] = useState(null);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isEditMode) return undefined;

    const ac = new AbortController();
    abortRef.current = ac;

    async function loadPharmacy() {
      setPageLoading(true);
      setError("");

      try {
        const result = await getAdminPharmacy(pharmacyId, ac.signal);
        setForm({
          name: result?.name || "",
          address: result?.address || "",
          phone: result?.phone || "",
          openingHours: result?.openingHours || "09:00 - 22:00",
          email: result?.email || "",
          mapLink: result?.mapLink || "",
          status: result?.status || "ACTIVE",
          notes: result?.notes || ""
        });
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Aptek məlumatını yükləmək mümkün olmadı");
      } finally {
        setPageLoading(false);
      }
    }

    loadPharmacy();

    return () => ac.abort();
  }, [isEditMode, pharmacyId]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let medicinesToImport = [];

      if (!isEditMode && medicinesFile) {
        medicinesToImport = await parseMedicinesFile(medicinesFile);
      }

      if (isEditMode) {
        await updateAdminPharmacy(pharmacyId, form);
        setSuccess("Aptek məlumatı uğurla yeniləndi");
      } else {
        const createdPharmacy = await createAdminPharmacy(form);

        if (medicinesToImport.length > 0) {
          const results = await Promise.allSettled(
            medicinesToImport.map((item) =>
              createAdminMedicine({
                ...item,
                pharmacyId: createdPharmacy?._id || createdPharmacy?.id
              })
            )
          );

          const failedCount = results.filter((item) => item.status === "rejected").length;

          if (failedCount > 0) {
            setError(`Aptek yaradıldı, amma ${failedCount} dərman fayldan import olunmadı.`);
          } else {
            setSuccess(`Yeni aptek uğurla əlavə edildi və ${medicinesToImport.length} dərman import olundu`);
          }
        } else {
          setSuccess("Yeni aptek uğurla əlavə edildi");
        }
      }

      setTimeout(() => navigate("/admin/pharmacies", { replace: true }), 1200);
    } catch (err) {
      setError(err?.message || (isEditMode ? "Aptek yenilənmədi" : "Aptek əlavə etmək mümkün olmadı"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout
      title={isEditMode ? "Apteki Redaktə Et" : "Yeni Aptek Əlavə Et"}
      subtitle={isEditMode ? "Aptek məlumatlarını yeniləyin" : "Yeni aptek əlavə edin"}
    >
      <section className="admin-backline">
        <Link to="/admin/pharmacies" className="admin-backlink">
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

          {!isEditMode ? (
            <label className="admin-form__field admin-form__field--full">
              <span>Dərman Faylı</span>
              <input
                type="file"
                accept=".json,.csv,application/json,text/csv"
                onChange={(e) => setMedicinesFile(e.target.files?.[0] || null)}
              />
            </label>
          ) : null}

          {error ? <div className="admin-form__message admin-form__message--error">{error}</div> : null}
          {success ? <div className="admin-form__message admin-form__message--success">{success}</div> : null}

          <div className="admin-form__footer">
            <Link to="/admin/pharmacies" className="admin-secondary-btn">
              Ləğv et
            </Link>
            <button type="submit" className="admin-primary-btn" disabled={loading}>
              <i className="fa-regular fa-floppy-disk"></i>
              {loading ? (isEditMode ? "Yenilənir..." : "Əlavə edilir...") : isEditMode ? "Yadda Saxla" : "Əlavə Et"}
            </button>
          </div>
        </form>
        )}
      </section>
    </AdminLayout>
  );
}
