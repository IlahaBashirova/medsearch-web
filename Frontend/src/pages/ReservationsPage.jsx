import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserReservationStats, getUserReservations, updateReservationStatus } from "../lib/reservationApi.js";
import { getToken } from "../lib/auth.js";
import { jwtDecode } from "../lib/jwtDecode.js";

function parseUserId() {
  try {
    const token = getToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded?.id || null;
  } catch {
    return null;
  }
}

function StatusBadge({ status }) {
  const map = {
    "Yadda saxlanıb": "badge badge--active",
    "Alındı": "badge badge--done",
    "Silinib": "badge badge--cancelled"
  };
  return <span className={map[status] || "badge"}>{status}</span>;
}

function formatUserStatus(status) {
  if (status === "Aktiv") return "Yadda saxlanıb";
  if (status === "Tamamlandı") return "Alındı";
  if (status === "Ləğv edildi") return "Silinib";
  return status;
}

function ReservationCard({ item, onCancel, cancelling }) {
  const date = item.date ? new Date(item.date).toLocaleDateString("az-AZ") : "—";
  const time = item.time || (item.date ? new Date(item.date).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" }) : "—");

  return (
    <article className="res-card">
      <div className="res-card__header">
        <div className="res-card__icon-wrap">
          <i className="fa-solid fa-capsules"></i>
        </div>
        <div className="res-card__title-wrap">
          <h3 className="res-card__title">{item.medicineName}</h3>
          <p className="res-card__qty">Miqdar: {item.quantity} ədəd</p>
        </div>
        <StatusBadge status={formatUserStatus(item.status)} />
      </div>

      <div className="res-card__pharmacy">
        <p className="res-card__pharmacy-name">{item.pharmacyName}</p>
        {item.address ? (
          <p className="res-card__row">
            <i className="fa-solid fa-location-dot"></i>
            <span>{item.address}</span>
          </p>
        ) : null}
        {item.phone ? (
          <p className="res-card__row">
            <i className="fa-solid fa-phone"></i>
            <span>{item.phone}</span>
          </p>
        ) : null}
      </div>

      <div className="res-card__footer">
        <span className="res-card__meta">
          <i className="fa-regular fa-calendar"></i> {date}
        </span>
        <span className="res-card__meta">
          <i className="fa-regular fa-clock"></i> {time}
        </span>
      </div>

      <div className="res-card__bottom">
        <span className="res-card__total-label">Ümumi məbləğ:</span>
        <span className="res-card__total-value">
          {Number.isFinite(item.price) ? `${(item.price * item.quantity).toFixed(2)} ₼` : "—"}
        </span>
      </div>

      {item.status === "Aktiv" ? (
        <div className="res-card__actions">
          <button
            className="btn btn--danger-outline btn--sm"
            disabled={cancelling === item._id}
            onClick={() => onCancel(item._id)}
          >
            {cancelling === item._id ? "Silinir..." : "Siyahıdan sil"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function ReservationsPage() {
  const navigate = useNavigate();
  const userId = parseUserId();

  const [stats, setStats] = useState({ aktiv: 0, tamamlandi: 0, legvEdildi: 0 });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!userId) { setError("İstifadəçi tapılmadı"); setLoading(false); return; }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [resList, statsRes] = await Promise.all([
        getUserReservations(userId, ac.signal),
        getUserReservationStats(userId, ac.signal)
      ]);

      setReservations(Array.isArray(resList) ? resList : resList?.reservations || []);
      setStats({
        aktiv: statsRes?.aktiv ?? statsRes?.active ?? 0,
        tamamlandi: statsRes?.tamamlandi ?? statsRes?.completed ?? 0,
        legvEdildi: statsRes?.legvEdildi ?? statsRes?.cancelled ?? 0
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  async function handleCancel(reservationId) {
    if (!window.confirm("Bu dərmanı yadda saxlananlar siyahısından silmək istədiyinizə əminsiniz?")) return;
    setCancelling(reservationId);
    try {
      await updateReservationStatus(reservationId, "Ləğv edildi");
      await load();
    } catch (err) {
      alert(err?.message || "Silmək mümkün olmadı");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <main className="page page-reservations">
      <div className="page-reservations__container">
        <header className="page-header">
          <button className="btn-back" onClick={() => navigate(-1)} aria-label="Geri">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="page-header__title">Yadda saxlanan dərmanlar</h1>
        </header>

        {/* Summary card */}
        <section className="res-summary card" style={{ width: "100%" }}>
          <div className="res-summary__top">
            <div className="res-summary__icon-wrap">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
            <div>
              <h2 className="res-summary__title">Yadda saxladıqlarınız</h2>
              <p className="res-summary__sub">Sonra baxmaq və almaq üçün saxladığınız dərmanlar</p>
            </div>
          </div>

          <div className="res-summary__stats">
            <div className="res-stat">
              <span className="res-stat__num res-stat__num--active">{stats.aktiv}</span>
              <span className="res-stat__label">Yadda saxlanıb</span>
            </div>
            <div className="res-stat">
              <span className="res-stat__num res-stat__num--done">{stats.tamamlandi}</span>
              <span className="res-stat__label">Alındı</span>
            </div>
            <div className="res-stat">
              <span className="res-stat__num res-stat__num--cancelled">{stats.legvEdildi}</span>
              <span className="res-stat__label">Silinib</span>
            </div>
          </div>
        </section>

        {/* List */}
        <section className="res-list">
          {loading ? (
            <>
              {[1, 2, 3].map((n) => (
                <div key={n} className="res-card res-card--skeleton">
                  <div className="skeleton skeleton--title" />
                  <div className="skeleton skeleton--line" />
                  <div className="skeleton skeleton--line skeleton--short" />
                </div>
              ))}
            </>
          ) : error ? (
            <div className="info-box">{error}</div>
          ) : reservations.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-bag-shopping empty-state__icon"></i>
              <p>Hələ heç bir yadda saxlanan dərman yoxdur</p>
            </div>
          ) : (
            reservations.map((item) => (
              <ReservationCard
                key={item._id}
                item={item}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
