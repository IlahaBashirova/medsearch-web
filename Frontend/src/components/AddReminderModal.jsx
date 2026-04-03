import React, { useEffect } from "react";

function normalizeHours(str) {
  return String(str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AddReminderModal({ open, onClose, onSave }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" aria-hidden="false">
      <div className="modal__backdrop" onClick={onClose} />

      <div className="modal__dialog" role="dialog" aria-modal="true" aria-label="Dərman əlavə et">
        <header className="modal__head">
          <div className="modal__title">Dərman əlavə et</div>
          <button className="modal__close" type="button" onClick={onClose} aria-label="Bağla">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <form
          className="modal__body"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);

            const name = String(fd.get("name") || "").trim();
            const dose = String(fd.get("dose") || "").trim();
            const timesPerDay = Number(fd.get("timesPerDay") || 1);
            const hours = normalizeHours(String(fd.get("hours") || ""));
            const tag = String(fd.get("tag") || "").trim();

            if (!name || !dose || !Number.isFinite(timesPerDay) || hours.length === 0) {
              alert("Zəhmət olmasa bütün xanaları düzgün doldurun.");
              return;
            }

            try {
              await onSave?.({
                name,
                dose,
                timesPerDay,
                hours,
                tag
              });
              form.reset();
              onClose?.();
            } catch (error) {
              alert(error?.message || "Xatırlatma əlavə edilə bilmədi.");
            }
          }}
        >
          <label className="mfield">
            <span className="mfield__label">Dərman adı</span>
            <input className="minput" name="name" type="text" placeholder="Məs: Metformin" required />
          </label>

          <div className="mgrid">
            <label className="mfield">
              <span className="mfield__label">Doza</span>
              <input className="minput" name="dose" type="text" placeholder="Məs: 500mg" required />
            </label>

            <label className="mfield">
              <span className="mfield__label">Gündə neçə dəfə</span>
              <select className="minput" name="timesPerDay" defaultValue="2" required>
                <option value="1">1 dəfə</option>
                <option value="2">2 dəfə</option>
                <option value="3">3 dəfə</option>
              </select>
            </label>
          </div>

          <label className="mfield">
            <span className="mfield__label">Saatlar (vergüllə)</span>
            <input className="minput" name="hours" type="text" placeholder="Məs: 08:00, 20:00" required />
          </label>

          <label className="mfield">
            <span className="mfield__label">Kateqoriya (istəyə görə)</span>
            <input className="minput" name="tag" type="text" placeholder="Məs: Hipertoniya" />
          </label>

          <footer className="modal__foot">
            <button className="btn btn--outline" type="button" onClick={onClose}>
              Ləğv et
            </button>
            <button className="btn btn--primary" type="submit">
              Yadda saxla
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
