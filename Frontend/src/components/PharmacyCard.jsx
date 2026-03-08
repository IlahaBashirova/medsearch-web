import React from "react";

export default function PharmacyCard({ pharmacy, reserved, onDetails, onReserve }) {
  const hasPrice = Number.isFinite(pharmacy.price);
  const hasDistance = Boolean(pharmacy.distanceText);

  return (
    <article className="ph-card">
      <h3 className="ph-card__title">{pharmacy.name}</h3>

      {hasPrice ? <div className="pill pill--price">{pharmacy.price.toFixed(2)} ₼</div> : null}

      {hasDistance ? (
        <div className="ph-card__row">
          <i className="fa-solid fa-location-dot ph-card__icon"></i>
          <span>{pharmacy.distanceText}</span>
        </div>
      ) : null}

      <div className="ph-card__addr">{pharmacy.address}</div>

      <div className="ph-card__actions">
        <button className="btn btn--primary ph-card__btn" type="button" onClick={onDetails}>
          Detallara bax
        </button>

        <button className="btn btn--outline ph-card__btn" type="button" onClick={onReserve} disabled={reserved}>
          {reserved ? (
            <>
              <i className="fa-regular fa-circle-check"></i> Bron edildi
            </>
          ) : (
            <>
              <i className="fa-regular fa-calendar"></i> Rezervasiya
            </>
          )}
        </button>
      </div>

      {reserved ? <div className="reserved-badge">Bron edildi</div> : null}
    </article>
  );
}