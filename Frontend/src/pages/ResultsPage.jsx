import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import PharmacyCard from "../components/PharmacyCard.jsx";
import { searchPharmacies } from "../lib/api.js";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

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

        <div className="results__grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : sorted.map((p) => (
                <PharmacyCard
                  key={p.id}
                  pharmacy={p}
                  reserved={reservedIds.has(p.id)}
                  onDetails={() => navigate(`/pharmacy/${p.id}`)}
                  onReserve={() => setReservedIds((prev) => new Set(prev).add(p.id))}
                />
              ))}
        </div>
      </section>
    </main>
  );
}