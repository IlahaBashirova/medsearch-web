import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";
import ChatWidget from "../components/ChatWidget.jsx";
import { getPharmacyById } from "../lib/api.js";
import { cleanPhoneToTel } from "../lib/maps.js";

export default function PharmacyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pharmacy, setPharmacy] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setError("");

    getPharmacyById(id)
      .then((p) => mounted && setPharmacy(p))
      .catch((e) => {
        if (!mounted) return;
        setPharmacy(null);
        setError(e?.message || "Aptek tapılmadı");
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const coordsText = useMemo(() => {
    if (!pharmacy) return "Koordinatlar: —";
    return `Koordinatlar: ${Number(pharmacy.lat).toFixed(4)}, ${Number(pharmacy.lng).toFixed(4)}`;
  }, [pharmacy]);

  useEffect(() => {
    if (searchParams.get("chat") !== "1") return;
    setChatOpen(true);
  }, [searchParams]);

  return (
    <main className="page page-detail">
      <Topbar
        title="Aptek detalları"
        left={
          <button className="icon-btn" type="button" aria-label="Geri" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        }
      />

      <section className="detail">
        {error ? <div className="info-box">{error}</div> : null}

        <article className="detail-card">
          <h2 className="detail-card__title">{pharmacy?.name ?? "—"}</h2>

          <div className="pill pill--price detail-card__pill">
            Qiymət: {Number(pharmacy?.price ?? 0).toFixed(2)} ₼
          </div>

          <div className="detail-card__section">
            <div className="detail-item">
              <i className="fa-solid fa-location-dot detail-item__icon"></i>
              <div className="detail-item__body">
                <div className="detail-item__label">Ünvan</div>
                <div className="detail-item__text">{pharmacy?.address ?? "—"}</div>
                <span className="detail-item__link">{pharmacy?.distanceText ?? "—"}</span>
              </div>
            </div>
          </div>

          <hr className="detail-card__hr" />

          <div className="detail-card__section">
            <div className="detail-item">
              <i className="fa-solid fa-phone detail-item__icon"></i>
              <div className="detail-item__body">
                <div className="detail-item__label">Telefon</div>
                <a className="detail-item__link" href={cleanPhoneToTel(pharmacy?.phone) ?? "#"}>
                  {pharmacy?.phone ?? "—"}
                </a>
              </div>
            </div>
          </div>

          <hr className="detail-card__hr" />

          <div className="detail-card__section">
            <div className="detail-item">
              <i className="fa-regular fa-clock detail-item__icon"></i>
              <div className="detail-item__body">
                <div className="detail-item__label">İş saatları</div>
                <div className="detail-item__text">
                  Bazar ertəsi - Cümə: 08:00 - 22:00
                  <br />
                  Şənbə - Bazar: 09:00 - 20:00
                </div>
              </div>
            </div>
          </div>

          <div className="detail-actions">
            <button
              className="btn btn--primary detail-actions__btn"
              type="button"
              onClick={() => {
                const tel = cleanPhoneToTel(pharmacy?.phone);
                if (!tel) return alert("Telefon nömrəsi tapılmadı.");
                window.location.href = tel;
              }}
            >
              <i className="fa-solid fa-phone"></i>
              Zəng et
            </button>

            <button
              className="btn btn--outline detail-actions__btn"
              type="button"
              onClick={() => {
                const link = pharmacy?.mapLink;
                if (!link) return alert("Xəritə linki tapılmadı.");
                window.open(link, "_blank", "noopener,noreferrer");
              }}
            >
              <i className="fa-solid fa-location-arrow"></i>
              İstiqamətlər
            </button>

            <button className="btn btn--purple detail-actions__btn" type="button" onClick={() => setChatOpen(true)}>
              <i className="fa-regular fa-comment-dots"></i>
              Konsultasiya
            </button>
          </div>
        </article>

        <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} pharmacy={pharmacy} />

        <article className="map-card">
          <div className="map-card__head">Xəritədə yeri</div>
          <div className="map-card__body">
            <div className="map-placeholder" role="img" aria-label="Google Maps inteqrasiyası">
              <div className="map-placeholder__icon">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="map-placeholder__title">Google Maps Inteqrasiyası</div>
              <div className="map-placeholder__sub">{coordsText}</div>
              <button
                className="btn btn--primary map-placeholder__btn"
                type="button"
                onClick={() => {
                  const link = pharmacy?.mapLink;
                  if (!link) return alert("Xəritə linki tapılmadı.");
                  window.open(link, "_blank", "noopener,noreferrer");
                }}
              >
                Google Maps-da aç
              </button>
            </div>
          </div>
        </article>

        <div className="note">
          <strong>Qeyd:</strong> Dərmanın mövcudluğunu təsdiqləmək üçün zəng edərək soruşun.
        </div>
      </section>
    </main>
  );
}
