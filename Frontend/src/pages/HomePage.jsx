import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function goSearch(text) {
    const query = (text ?? q).trim();
    if (!query) return;
    navigate(`/results?q=${encodeURIComponent(query)}`);
  }

  return (
    <main className="page page-home">
      <header className="nav">
        <div className="nav__left">
          <div className="nav__logo" aria-hidden="true">
            <i className="fa-solid fa-heart"></i>
          </div>
          <div className="nav__brand">MedSearch</div>
        </div>

        <button className="btn btn--pill" type="button" onClick={() => navigate("/profile")}>
          <i className="fa-regular fa-user"></i>
          Profil
        </button>
      </header>

      <section className="hero">
        <div className="hero__icon" aria-hidden="true">
          <i className="fa-solid fa-capsules"></i>
        </div>

        <h1 className="hero__title">Dərmanı asanlıqla tapın</h1>
        <p className="hero__subtitle">Ən yaxın apteklərdə lazımi dərmanı axtarın</p>

        <div className="search">
          <span className="search__left" aria-hidden="true">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>

          <input
            className="search__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Dərman adını daxil edin"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goSearch();
              }
            }}
          />

          <span className="search__mid" aria-hidden="true" title="Səs">
            <i className="fa-solid fa-microphone"></i>
          </span>

          <span className="search__mid" aria-hidden="true" title="Kamera">
            <i className="fa-regular fa-camera"></i>
          </span>

          <button className="btn btn--primary btn--search" type="button" onClick={() => goSearch()}>
            Axtar
          </button>
        </div>

        <div className="popular">
          <div className="popular__label">Populyar axtarışlar:</div>
          <div className="chips">
            {["Paracetamol", "Aspirin", "Nurofen", "Vitamin D", "Antibiotik"].map((x) => (
              <button key={x} className="chip" type="button" onClick={() => goSearch(x)}>
                {x}
              </button>
            ))}
          </div>
        </div>

        <section className="features" aria-label="Üstünlüklər">
          <div className="features__grid">
            <article className="feature-card" tabIndex={0}>
              <div className="feature-card__icon" aria-hidden="true">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
              <h3 className="feature-card__title">Sürətli axtarış</h3>
              <p className="feature-card__text">Dərmanları saniyələr ərzində tapın</p>
            </article>

            <article className="feature-card" tabIndex={0}>
              <div className="feature-card__icon" aria-hidden="true">
                <i className="fa-solid fa-heart"></i>
              </div>
              <h3 className="feature-card__title">Yaxın apteklər</h3>
              <p className="feature-card__text">Ən yaxın məsafədəki aptekləri görün</p>
            </article>

            <article className="feature-card" tabIndex={0}>
              <div className="feature-card__icon" aria-hidden="true">
                <i className="fa-solid fa-pills"></i>
              </div>
              <h3 className="feature-card__title">Qiymət müqayisəsi</h3>
              <p className="feature-card__text">Ən əlverişli qiymətləri tapın</p>
            </article>
          </div>
        </section>
      </section>

      <footer className="footnote">Məlumatlarınız təhlükəsizdir və qorunur</footer>
    </main>
  );
}