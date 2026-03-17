import React from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import {
  dashboardMetrics,
  recentActivities,
  recentReservations,
  reservationBars,
  weeklyActivity
} from "../lib/adminMockData.js";

function MetricCard({ item }) {
  return (
    <article className="admin-metric-card">
      <div className={`admin-metric-card__icon admin-metric-card__icon--${item.tone}`}>
        <i className={item.icon}></i>
      </div>
      <div className="admin-metric-card__change">{item.change}</div>
      <p>{item.label}</p>
      <strong>{item.value}</strong>
    </article>
  );
}

function LineChartCard() {
  const points = weeklyActivity
    .map((value, index) => {
      const x = (index / (weeklyActivity.length - 1)) * 100;
      const y = 100 - (value / 450) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="admin-panel-card">
      <div className="admin-panel-card__head">
        <h3>Həftəlik Aktivlik</h3>
        <i className="fa-solid fa-wave-square"></i>
      </div>
      <div className="admin-line-chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={points} />
        </svg>
        <div className="admin-chart-labels">
          {["Baz", "Çərş Ax", "Çərş", "Cüm Ax", "Cüm", "Şən", "Baz"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function BarChartCard() {
  return (
    <article className="admin-panel-card">
      <div className="admin-panel-card__head">
        <h3>Rezervasiya Statistikası</h3>
      </div>
      <div className="admin-bar-chart">
        {reservationBars.map((value, index) => (
          <div key={index} className="admin-bar-chart__item">
            <span style={{ height: `${Math.max(14, value / 10)}px` }} />
          </div>
        ))}
      </div>
      <div className="admin-chart-labels">
        {["Baz", "Çərş Ax", "Çərş", "Cüm Ax", "Cüm", "Şən", "Baz"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </article>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard" subtitle="Sistem statistikalarına və fəaliyyətlərə baxış">
      <section className="admin-metrics-grid">
        {dashboardMetrics.map((item) => (
          <MetricCard key={item.label} item={item} />
        ))}
      </section>

      <section className="admin-charts-grid">
        <LineChartCard />
        <BarChartCard />
      </section>

      <section className="admin-panels-grid">
        <article className="admin-panel-card">
          <div className="admin-panel-card__head">
            <h3>Son Rezervasiyalar</h3>
          </div>
          <div className="admin-list">
            {recentReservations.map((item) => (
              <div key={`${item.user}-${item.date}`} className="admin-list__item">
                <div>
                  <strong>{item.user}</strong>
                  <p>{item.item}</p>
                  <span>{item.date}</span>
                </div>
                <em
                  className={`admin-status admin-status--${
                    item.status === "Təsdiqləndi"
                      ? "success"
                      : item.status === "Ləğv edildi"
                        ? "danger"
                        : "warning"
                  }`}
                >
                  {item.status}
                </em>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel-card">
          <div className="admin-panel-card__head">
            <h3>Son Fəaliyyətlər</h3>
          </div>
          <div className="admin-list">
            {recentActivities.map((item) => (
              <div key={`${item.title}-${item.time}`} className="admin-list__item admin-list__item--activity">
                <div className="admin-list__icon">
                  <i className={item.icon}></i>
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.actor}</p>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminLayout>
  );
}
