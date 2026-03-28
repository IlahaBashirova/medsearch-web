import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import PharmacyCard from "../components/PharmacyCard.jsx";
import { searchPharmacies } from "../lib/api.js";
import { createReservation } from "../lib/reservationApi.js";
import { getSessionUser } from "../lib/auth.js";

function CardSkeleton() {
  return (
    <article className="ph-card ph-card--skeleton" aria-hidden="true">
      <div className="sk sk-title" />
      <div className="sk sk-pill" />
      <div className="sk sk-row" />
      <div className="sk sk-addr" />
      <div className="sk sk-btn" />
      <div className="sk sk-btn" />
    </article>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const [items, setItems] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [reservedIds, setReservedIds] = useState(() => new Set());
  const [reservingId, setReservingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reserveError, setReserveError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    setReserveError("");

    searchPharmacies(q)
      .then((data) => {
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setItems([]);
        setError(e?.message || "Xəta baş verdi");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [q]);

  async function handleReserve(pharmacy) {
    if (reservedIds.has(pharmacy.id) || reservingId) return;

    if (getSessionUser().isGuest) {
      setReserveError("Rezervasiya üçün giriş edin.");
      return;
    }

    setReserveError("");
    setReservingId(pharmacy.id);

    try {
      await createReservation({
        pharmacyName: pharmacy.name,
        medicineName: q,
        quantity: 1,
        price: Number(pharmacy.price) || 0,
        address: pharmacy.address || "",
        phone: pharmacy.phone || ""
      });

      setReservedIds((prev) => new Set(prev).add(pharmacy.id));
    } catch (e) {
      setReserveError(e?.message || "Rezervasiya yaratmaq mümkün olmadı");
    } finally {
      setReservingId("");
    }
  }

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const pa = Number.isFinite(a.price) ? a.price : Infinity;
      const pb = Number.isFinite(b.price) ? b.price : Infinity;
      return sortAsc ? pa - pb : pb - pa;
    });
    return arr;
  }, [items, sortAsc]);

  return (
    <main className="page page-results">
      <Topbar
        title="Axtarış nəticələri"
        subtitle={
          <>
            "<span>{q || "—"}</span>" üçün
          </>
        }
        left={
          <button className="icon-btn" type="button" aria-label="Geri" onClick={() => navigate("/home")}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        }
      />

      <section className="results">
        <div className="results__head">
          <div className="results__count">
            <span>{sorted.length}</span> aptek tapıldı
          </div>

          <button className="sort" type="button" onClick={() => setSortAsc((v) => !v)}>
            <i className="fa-solid fa-up-down"></i>
            {sortAsc ? "Ucuzdan bahaya" : "Bahadan ucuza"}
          </button>
        </div>

        {error ? <div className="info-box">{error}</div> : null}
        {!error && reserveError ? <div className="info-box">{reserveError}</div> : null}

        <div className="results__grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : sorted.map((p) => (
                <PharmacyCard
                  key={p.id}
                  pharmacy={p}
                  reserved={reservedIds.has(p.id)}
                  reserving={reservingId === p.id}
                  onDetails={() => navigate(`/pharmacy/${p.id}`)}
                  onReserve={() => handleReserve(p)}
                />
              ))}
        </div>
      </section>
    </main>
  );
}
