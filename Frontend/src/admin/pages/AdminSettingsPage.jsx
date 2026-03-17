import React, { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import {
  getAdminQuickActions,
  getAdminSettings,
  getAdminSystemInfo,
  updateAdminSettings
} from "../lib/adminApi.js";

const initialForm = {
  general: {
    platformName: "",
    supportEmail: "",
    supportPhone: "",
    timezone: "UTC",
    maintenanceMode: false
  },
  notifications: {
    emailEnabled: false,
    pushEnabled: false,
    reservationAlerts: false,
    reminderAlerts: false
  },
  email: {
    fromName: "",
    fromAddress: "",
    replyTo: "",
    provider: "smtp"
  },
  security: {
    sessionTtlHours: 168,
    passwordMinLength: 8,
    require2faForAdmins: false,
    allowNewAdminRegistration: false
  }
};

function updateSection(setForm, section, key, value) {
  setForm((prev) => ({
    ...prev,
    [section]: {
      ...prev[section],
      [key]: value
    }
  }));
}

function formatBytes(value) {
  if (!value && value !== 0) return "—";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUptime(seconds) {
  if (!seconds) return "0 dəq";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes} dəq`;
  return `${hours} saat ${minutes} dəq`;
}

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

function SettingCard({ title, icon, children }) {
  return (
    <section className="admin-settings-card">
      <div className="admin-settings-card__head">
        <h3>
          <i className={icon} aria-hidden="true"></i>
          {title}
        </h3>
      </div>
      <div className="admin-settings-card__body">{children}</div>
    </section>
  );
}

function ActionLabel({ action }) {
  const labelMap = {
    exportUsers: "İstifadəçiləri ixrac et",
    reviewReservations: "Rezervasiyalara baxış",
    resolveSupport: "Dəstək sorğularını həll et"
  };

  return labelMap[action.key] || action.label;
}

export default function AdminSettingsPage() {
  const abortRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [systemInfo, setSystemInfo] = useState(null);
  const [quickActions, setQuickActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [settings, info, actions] = await Promise.all([
        getAdminSettings(ac.signal),
        getAdminSystemInfo(ac.signal),
        getAdminQuickActions(ac.signal)
      ]);

      setForm({
        general: { ...initialForm.general, ...(settings?.general || {}) },
        notifications: { ...initialForm.notifications, ...(settings?.notifications || {}) },
        email: { ...initialForm.email, ...(settings?.email || {}) },
        security: { ...initialForm.security, ...(settings?.security || {}) }
      });
      setSystemInfo(info || null);
      setQuickActions(Array.isArray(actions?.actions) ? actions.actions : []);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Parametrləri yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    return () => abortRef.current?.abort();
  }, [loadData]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateAdminSettings(form);
      setMessage("Parametrlər uğurla yadda saxlanıldı");
    } catch (err) {
      setError(err?.message || "Parametrləri yadda saxlamaq mümkün olmadı");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Parametrlər" subtitle="Sistem ayarlarını idarə edin">
      {loading ? (
        <section className="admin-empty-state">Yüklənir...</section>
      ) : error && !message ? (
        <section className="admin-empty-state admin-empty-state--error">{error}</section>
      ) : (
        <form className="admin-settings-layout" onSubmit={handleSubmit}>
          <div className="admin-settings-stack">
            <SettingCard title="Ümumi Parametrlər" icon="fa-solid fa-globe">
              <div className="admin-form admin-form--settings">
                <label className="admin-form__field admin-form__field--full">
                  <span>Sayt Adı</span>
                  <input
                    value={form.general.platformName}
                    onChange={(e) => updateSection(setForm, "general", "platformName", e.target.value)}
                  />
                </label>

                <label className="admin-form__field">
                  <span>Dəstək Emaili</span>
                  <input
                    type="email"
                    value={form.general.supportEmail}
                    onChange={(e) => updateSection(setForm, "general", "supportEmail", e.target.value)}
                  />
                </label>

                <label className="admin-form__field">
                  <span>Dəstək Telefonu</span>
                  <input
                    value={form.general.supportPhone}
                    onChange={(e) => updateSection(setForm, "general", "supportPhone", e.target.value)}
                  />
                </label>

                <label className="admin-form__field">
                  <span>Saat Qurşağı</span>
                  <input
                    value={form.general.timezone}
                    onChange={(e) => updateSection(setForm, "general", "timezone", e.target.value)}
                  />
                </label>

                <div className="admin-form__field admin-form__field--full">
                  <div className="admin-settings-highlight">
                    <div>
                      <strong>Texniki xidmət rejimi</strong>
                      <span>Saytı müvəqqəti bağla</span>
                    </div>
                    <span className={`admin-switch${form.general.maintenanceMode ? " admin-switch--active" : ""}`}>
                      <input
                        type="checkbox"
                        checked={form.general.maintenanceMode}
                        onChange={(e) => updateSection(setForm, "general", "maintenanceMode", e.target.checked)}
                      />
                      <span />
                    </span>
                  </div>
                </div>
              </div>
            </SettingCard>

            <SettingCard title="Bildiriş Parametrləri" icon="fa-regular fa-bell">
              <div className="admin-settings-list">
                <ToggleField
                  label="Email Bildirişləri"
                  hint="Email vasitəsilə bildiriş al"
                  checked={form.notifications.emailEnabled}
                  onChange={(value) => updateSection(setForm, "notifications", "emailEnabled", value)}
                />
                <ToggleField
                  label="Push Bildirişləri"
                  hint="Brauzerdə bildiriş göstər"
                  checked={form.notifications.pushEnabled}
                  onChange={(value) => updateSection(setForm, "notifications", "pushEnabled", value)}
                />
                <ToggleField
                  label="Rezervasiya Bildirişləri"
                  hint="Yeni rezervasiya olduqda xəbər ver"
                  checked={form.notifications.reservationAlerts}
                  onChange={(value) => updateSection(setForm, "notifications", "reservationAlerts", value)}
                />
                <ToggleField
                  label="Xatırlatma Bildirişləri"
                  hint="Xatırlatma yeniləmələri üçün xəbər ver"
                  checked={form.notifications.reminderAlerts}
                  onChange={(value) => updateSection(setForm, "notifications", "reminderAlerts", value)}
                />
              </div>
            </SettingCard>

            <SettingCard title="Email Parametrləri" icon="fa-regular fa-envelope">
              <div className="admin-form admin-form--settings">
                <label className="admin-form__field">
                  <span>Göndərən Adı</span>
                  <input
                    value={form.email.fromName}
                    onChange={(e) => updateSection(setForm, "email", "fromName", e.target.value)}
                  />
                </label>

                <label className="admin-form__field">
                  <span>Provider</span>
                  <input
                    value={form.email.provider}
                    onChange={(e) => updateSection(setForm, "email", "provider", e.target.value)}
                  />
                </label>

                <label className="admin-form__field admin-form__field--full">
                  <span>Göndərən Email</span>
                  <input
                    type="email"
                    value={form.email.fromAddress}
                    onChange={(e) => updateSection(setForm, "email", "fromAddress", e.target.value)}
                  />
                </label>

                <label className="admin-form__field admin-form__field--full">
                  <span>Reply-To Email</span>
                  <input
                    type="email"
                    value={form.email.replyTo}
                    onChange={(e) => updateSection(setForm, "email", "replyTo", e.target.value)}
                  />
                </label>
              </div>
            </SettingCard>

            <SettingCard title="Təhlükəsizlik Parametrləri" icon="fa-regular fa-shield-halved">
              <div className="admin-form admin-form--settings">
                <div className="admin-form__field admin-form__field--full">
                  <ToggleField
                    label="İki Faktorlu Autentifikasiya"
                    hint="Admin hesabları üçün əlavə təhlükəsizlik qatı"
                    checked={form.security.require2faForAdmins}
                    onChange={(value) => updateSection(setForm, "security", "require2faForAdmins", value)}
                  />
                </div>

                <label className="admin-form__field">
                  <span>Sessiya Vaxtı (saat)</span>
                  <input
                    type="number"
                    min="1"
                    value={form.security.sessionTtlHours}
                    onChange={(e) =>
                      updateSection(setForm, "security", "sessionTtlHours", Number(e.target.value) || 1)
                    }
                  />
                </label>

                <label className="admin-form__field">
                  <span>Minimum Şifrə Uzunluğu</span>
                  <input
                    type="number"
                    min="6"
                    value={form.security.passwordMinLength}
                    onChange={(e) =>
                      updateSection(setForm, "security", "passwordMinLength", Number(e.target.value) || 6)
                    }
                  />
                </label>

                <div className="admin-form__field admin-form__field--full">
                  <ToggleField
                    label="Yeni admin qeydiyyatına icazə ver"
                    hint="Sistem üzərindən yeni admin hesabları yaradılsın"
                    checked={form.security.allowNewAdminRegistration}
                    onChange={(value) => updateSection(setForm, "security", "allowNewAdminRegistration", value)}
                  />
                </div>
              </div>
            </SettingCard>
          </div>

          <aside className="admin-settings-side">
            <section className="admin-settings-card">
              <div className="admin-settings-card__body">
                <button type="submit" className="admin-primary-btn admin-settings-save" disabled={saving}>
                  <i className="fa-regular fa-floppy-disk" aria-hidden="true"></i>
                  {saving ? "Yadda saxlanılır..." : "Parametrləri Saxla"}
                </button>

                {error ? <div className="admin-form__message admin-form__message--error">{error}</div> : null}
                {message ? <div className="admin-form__message admin-form__message--success">{message}</div> : null}
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-card__head">
                <h3>
                  <i className="fa-solid fa-server" aria-hidden="true"></i>
                  Sistem Məlumatı
                </h3>
              </div>
              <div className="admin-settings-card__body">
                <div className="admin-info-list">
                  <div><span>Node versiyası</span><strong>{systemInfo?.nodeVersion || "—"}</strong></div>
                  <div><span>Platforma</span><strong>{systemInfo?.platform || "—"}</strong></div>
                  <div><span>Host</span><strong>{systemInfo?.hostname || "—"}</strong></div>
                  <div><span>Uptime</span><strong>{formatUptime(systemInfo?.uptimeSeconds)}</strong></div>
                  <div><span>RAM</span><strong>{formatBytes(systemInfo?.memoryUsage?.rss)}</strong></div>
                </div>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-card__head">
                <h3>
                  <i className="fa-solid fa-bolt" aria-hidden="true"></i>
                  Sürətli Əməliyyatlar
                </h3>
              </div>
              <div className="admin-settings-card__body">
                {quickActions.length === 0 ? (
                  <div className="admin-empty-inline">Sürətli əməliyyat yoxdur</div>
                ) : (
                  <div className="admin-quick-actions">
                    {quickActions.map((action) => (
                      <div key={action.key} className="admin-quick-actions__item">
                        <span>{ActionLabel({ action })}</span>
                        <em className={`admin-status admin-status--${action.enabled ? "success" : "danger"}`}>
                          {action.enabled ? "Aktiv" : "Deaktiv"}
                        </em>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </aside>
        </form>
      )}
    </AdminLayout>
  );
}
