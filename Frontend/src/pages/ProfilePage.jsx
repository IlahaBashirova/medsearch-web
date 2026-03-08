import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import AddReminderModal from "../components/AddReminderModal.jsx";
import { getBellStates, getReminders, setBellStates, setReminders } from "../lib/storage.js";

function formatTimesText(timesCount, hoursArr) {
  const timesLabel = `Gündə ${timesCount} dəfə`;
  const hoursLabel = Array.isArray(hoursArr) && hoursArr.length ? ` - ${hoursArr.join(", ")}` : "";
  return `${timesLabel}${hoursLabel}`;
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [reminders, setRemindersState] = useState(() => getReminders());
  const [bells, setBellsState] = useState(() => getBellStates());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => setReminders(reminders), [reminders]);
  useEffect(() => setBellStates(bells), [bells]);

  const schedule = useMemo(() => {
    const rows = [];
    reminders.forEach((r) => {
      (r.hours || []).forEach((h) => rows.push({ time: h, name: r.name, dose: r.dose }));
    });
    rows.sort((a, b) => String(a.time).localeCompare(String(b.time)));
    return rows;
  }, [reminders]);

  function toggleBell(key) {
    setBellsState((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  }

  function bellClass(isOn) {
    return isOn ? "is-bell-on" : "is-bell-off";
  }

  return (
    <main className="page page-profile">
      <Topbar
        title="Profil"
        left={
          <button className="icon-btn" type="button" aria-label="Geri" onClick={() => navigate("/home")}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        }
        right={
          <button className="profile-exit" type="button" onClick={() => navigate("/auth")}>
            Çıxış
          </button>
        }
      />

      <section className="profile">
        <article className="user-card">
          <div className="user-card__avatar" aria-hidden="true">
            <i className="fa-regular fa-user"></i>
          </div>
          <div className="user-card__info">
            <div className="user-card__name">İstifadəçi</div>
            <div className="user-card__email">user@example.com</div>
          </div>
        </article>

        <article className="panel">
          <header className="panel__head panel__head--teal">
            <div className="panel__head-left">
              <i className="fa-regular fa-calendar"></i>
              <span>Günlük Dərman Cədvəli</span>
            </div>
          </header>

          <div className="panel__body panel__body--teal">
            {schedule.length === 0 ? (
              <div className="info-box">Hələ cədvəldə dərman yoxdur. “Əlavə et” ilə əlavə edə bilərsiniz.</div>
            ) : (
              schedule.map((s, idx) => {
                const key = `schedule_${idx}`;
                const isOn = bells[key] ?? true;

                return (
                  <div className="schedule-item" key={key}>
                    <div className="schedule-item__left">
                      <div className="schedule-item__icon">
                        <i className="fa-regular fa-clock"></i>
                      </div>
                      <div className="schedule-item__main">
                        <div className="schedule-item__time">{s.time}</div>
                        <div className="schedule-item__drug">
                          <i className="fa-solid fa-capsules"></i>
                          {s.name} <span className="schedule-item__dose">({s.dose})</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`schedule-item__bell ${bellClass(isOn)}`}
                      type="button"
                      onClick={() => toggleBell(key)}
                      aria-pressed={String(isOn)}
                      title="Xatırlatma"
                    >
                      <i className="fa-regular fa-bell"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="panel">
          <header className="panel__head panel__head--light">
            <div className="panel__head-left">
              <i className="fa-regular fa-bell"></i>
              <span>Dərman Xatırlatmaları</span>
            </div>

            <button className="btn btn--primary panel__add" type="button" onClick={() => setModalOpen(true)}>
              <i className="fa-solid fa-plus"></i>
              Əlavə et
            </button>
          </header>

          <div className="panel__body">
            <div className="info-box">
              <strong>Xroniki xəstəliklər üçün:</strong> Dərmanlarınızı vaxtında qəbul etməyi unutmayın!
            </div>

            {reminders.map((r) => {
              const isOn = bells[r.id] ?? true;

              return (
                <article className="reminder-card" key={r.id}>
                  <div className="reminder-card__left">
                    <div className="reminder-card__icon">
                      <i className="fa-solid fa-capsules"></i>
                    </div>
                    <div className="reminder-card__main">
                      <div className="reminder-card__title">{r.name}</div>
                      <div className="reminder-card__sub">{r.dose}</div>
                      <div className="reminder-card__meta">
                        <i className="fa-regular fa-clock"></i>
                        {formatTimesText(r.timesPerDay, r.hours)}
                      </div>
                      {r.tag ? <div className="tag tag--purple">{r.tag}</div> : null}
                    </div>
                  </div>

                  <div className="reminder-card__actions">
                    <button
                      className={`icon-square ${bellClass(isOn)}`}
                      type="button"
                      onClick={() => toggleBell(r.id)}
                      aria-pressed={String(isOn)}
                      title="Bildiriş"
                    >
                      <i className="fa-regular fa-bell"></i>
                    </button>

                    <button
                      className="icon-trash"
                      type="button"
                      title="Sil"
                      onClick={() => {
                        setRemindersState((prev) => prev.filter((x) => x.id !== r.id));
                        setBellsState((prev) => {
                          const next = { ...prev };
                          delete next[r.id];
                          return next;
                        });
                      }}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <footer className="profile-footnote">
          🔒 Məlumatlarınız təhlükəsizdir. MedSearch PII və ya həssas məlumatları toplamaq üçün nəzərdə tutulmayıb.
        </footer>
      </section>

      <AddReminderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(rem) => setRemindersState((prev) => [...prev, rem])}
      />
    </main>
  );
}