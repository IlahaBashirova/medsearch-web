import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [q, setQ] = useState("");
  const [searchFeedback, setSearchFeedback] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  function goSearch(text) {
    const query = (text ?? q).trim();
    if (!query) return;
    navigate(`/results?q=${encodeURIComponent(query)}`);
  }

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // noop
      }
    };
  }, []);

  function handleVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSearchFeedback("Səsli axtarış bu brauzerdə dəstəklənmir.");
      return;
    }

    if (isListeningRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch {
        setSearchFeedback("Səsli axtarış dayandırıla bilmədi.");
      }
      return;
    }

    setSearchFeedback("");

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "az-AZ";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";

        if (!transcript) {
          setSearchFeedback("Səsli axtarışdan mətn alınmadı.");
          return;
        }

        setQ(transcript);
        setSearchFeedback("");
      };

      recognition.onerror = (event) => {
        isListeningRef.current = false;

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSearchFeedback("Mikrofon icazəsi verilmədi.");
          return;
        }

        if (event.error === "no-speech") {
          setSearchFeedback("Səs aşkarlanmadı. Yenidən cəhd edin.");
          return;
        }

        if (event.error === "audio-capture") {
          setSearchFeedback("Mikrofon tapılmadı və ya istifadə edilə bilmədi.");
          return;
        }

        setSearchFeedback("Səsli axtarış başlatmaq mümkün olmadı.");
      };

      recognition.onend = () => {
        isListeningRef.current = false;
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
    } catch {
      setSearchFeedback("Səsli axtarışı başlatmaq mümkün olmadı.");
    }
  }

  function normalizeImageQuery(fileName) {
    return String(fileName || "")
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function handleImageAction() {
    setSearchFeedback("");
    fileInputRef.current?.click();
  }

  function handleImageSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const parsedText = normalizeImageQuery(file.name);

    if (!parsedText) {
      setSearchFeedback("Şəkildən axtarış mətni əldə etmək mümkün olmadı.");
      event.target.value = "";
      return;
    }

    setQ(parsedText);
    setSearchFeedback("");
    event.target.value = "";
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

          <button className="search__mid" type="button" title="Səs" aria-label="Səsli axtarış" onClick={handleVoiceSearch}>
            <i className="fa-solid fa-microphone"></i>
          </button>

          <button className="search__mid" type="button" title="Kamera" aria-label="Resept şəkli seç" onClick={handleImageAction}>
            <i className="fa-regular fa-camera"></i>
          </button>

          <button className="btn btn--primary btn--search" type="button" onClick={() => goSearch()}>
            Axtar
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelected}
          hidden
        />

        {searchFeedback ? <div className="info-box">{searchFeedback}</div> : null}

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
