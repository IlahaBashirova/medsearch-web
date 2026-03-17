import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../layout/AdminLayout.jsx";
import {
  getAdminAnalytics,
  getAdminMedicines,
  getAdminPharmacies,
  getAdminReservations,
  getAdminUsers
} from "../lib/adminApi.js";

const MONTH_LABELS = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
const PIE_COLORS = ["#159b90", "#3d7be2", "#ffb100", "#8f5cff", "#6b7280"];

function getCount(groups, key) {
  return groups.find((item) => item._id === key)?.count || 0;
}

function buildRecentMonthBuckets() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: MONTH_LABELS[date.getMonth()],
      year: date.getFullYear(),
      month: date.getMonth(),
      value: 0
    };
  });
}

function buildLinePoints(values, maxValue) {
  if (values.length <= 1) {
    return "0,100 100,100";
  }

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const safeMax = Math.max(maxValue, 1);
      const y = 100 - (value / safeMax) * 85 - 8;
      return `${x},${Math.max(8, Math.min(92, y))}`;
    })
    .join(" ");
}

function aggregateMonthly(items, valueGetter) {
  const buckets = buildRecentMonthBuckets();

  items.forEach((item) => {
    const raw = item?.createdAt;
    if (!raw) return;

    const date = new Date(raw);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = buckets.find((entry) => entry.key === key);
    if (bucket) {
      bucket.value += valueGetter(item);
    }
  });

  return buckets;
}

function aggregateCumulativeMonthly(items) {
  const buckets = buildRecentMonthBuckets();

  items.forEach((item) => {
    const raw = item?.createdAt;
    if (!raw) return;

    const date = new Date(raw);
    buckets.forEach((bucket) => {
      const bucketDate = new Date(bucket.year, bucket.month + 1, 0);
      if (date <= bucketDate) {
        bucket.value += 1;
      }
    });
  });

  return buckets;
}

function aggregateTopReservations(items, key) {
  const map = new Map();

  items.forEach((item) => {
    const name = item?.[key];
    if (!name) return;
    map.set(name, (map.get(name) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function aggregateCategories(medicines) {
  const map = new Map();

  medicines.forEach((item) => {
    const category = item?.category?.trim() || "Digər";
    map.set(category, (map.get(category) || 0) + 1);
  });

  const total = Array.from(map.values()).reduce((sum, count) => sum + count, 0);

  return Array.from(map.entries())
    .map(([name, count], index) => ({
      name,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
      color: PIE_COLORS[index % PIE_COLORS.length]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function MetricCard({ icon, tone, label, value, change }) {
  return (
    <article className="admin-metric-card">
      <div className={`admin-metric-card__icon admin-metric-card__icon--${tone}`}>
        <i className={icon} aria-hidden="true"></i>
      </div>
      <div className="admin-metric-card__change">{change}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function RankingList({ title, icon, items, itemLabel }) {
  return (
    <article className="admin-panel-card">
      <div className="admin-panel-card__head">
        <h3>{title}</h3>
        <i className={icon} aria-hidden="true"></i>
      </div>

      <div className="admin-ranking-list">
        {items.length === 0 ? (
          <div className="admin-empty-inline">Məlumat yoxdur</div>
        ) : (
          items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="admin-ranking-list__item">
              <div className="admin-ranking-list__index">{index + 1}</div>
              <div>
                <strong>{item.name}</strong>
                <span>{itemLabel(item)}</span>
              </div>
              <em>{item.count}</em>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

export default function AdminAnalyticsPage() {
  const abortRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState({
    analytics: null,
    users: [],
    medicines: [],
    pharmacies: [],
    reservations: []
  });

  const loadAnalytics = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError("");

    try {
      const [analytics, usersRes, medicinesRes, pharmaciesRes, reservationsRes] = await Promise.all([
        getAdminAnalytics(ac.signal),
        getAdminUsers({ limit: 200 }, ac.signal),
        getAdminMedicines({ limit: 200 }, ac.signal),
        getAdminPharmacies({ limit: 200 }, ac.signal),
        getAdminReservations({ limit: 200 }, ac.signal)
      ]);

      setPayload({
        analytics,
        users: Array.isArray(usersRes?.data) ? usersRes.data : [],
        medicines: Array.isArray(medicinesRes?.data) ? medicinesRes.data : [],
        pharmacies: Array.isArray(pharmaciesRes?.data) ? pharmaciesRes.data : [],
        reservations: Array.isArray(reservationsRes?.data) ? reservationsRes.data : []
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Analitika məlumatlarını yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    return () => abortRef.current?.abort();
  }, [loadAnalytics]);

  const derived = useMemo(() => {
    const analytics = payload.analytics || {};
    const reservationBuckets = aggregateMonthly(payload.reservations, () => 1);
    const userBuckets = aggregateCumulativeMonthly(payload.users);
    const topMedicines = aggregateTopReservations(payload.reservations, "medicineName");
    const topPharmacies = aggregateTopReservations(payload.reservations, "pharmacyName");
    const categories = aggregateCategories(payload.medicines);
    const totalReservations = (analytics.reservationsByStatus || []).reduce(
      (sum, item) => sum + (item.count || 0),
      0
    );
    const openSupport =
      getCount(analytics.supportByStatus || [], "OPEN") + getCount(analytics.supportByStatus || [], "PENDING");

    return {
      metrics: [
        {
          label: "Ümumi rezervasiyalar",
          value: totalReservations,
          change: `${getCount(analytics.reservationsByStatus || [], "CONFIRMED")} təsdiq`,
          icon: "fa-regular fa-calendar-check",
          tone: "mint"
        },
        {
          label: "Aktiv istifadəçilər",
          value: payload.users.filter((item) => item.status === "ACTIVE").length,
          change: `${getCount(analytics.usersByRole || [], "ADMIN")} admin`,
          icon: "fa-regular fa-user",
          tone: "blue"
        },
        {
          label: "Dərman sayı",
          value: analytics.medicineCount || payload.medicines.length,
          change: `${categories.length} kateqoriya`,
          icon: "fa-solid fa-capsules",
          tone: "violet"
        },
        {
          label: "Açıq dəstək söhbətləri",
          value: openSupport,
          change: `${getCount(analytics.supportByStatus || [], "RESOLVED")} həll olunub`,
          icon: "fa-regular fa-message",
          tone: "neutral"
        }
      ],
      reservationBuckets,
      userBuckets,
      topMedicines,
      topPharmacies,
      categories
    };
  }, [payload]);

  const reservationValues = derived.reservationBuckets.map((item) => item.value);
  const userValues = derived.userBuckets.map((item) => item.value);
  const linePoints = buildLinePoints(reservationValues, Math.max(...reservationValues, 1));
  const maxBarValue = Math.max(...userValues, 1);
  const pieBackground =
    derived.categories.length === 0
      ? "#eef2f7"
      : `conic-gradient(${derived.categories
          .map((item, index) => {
            const start = derived.categories.slice(0, index).reduce((sum, entry) => sum + entry.percent, 0);
            const end = start + item.percent;
            return `${item.color} ${start}% ${end}%`;
          })
          .join(", ")})`;

  const hasData =
    derived.metrics.some((item) => Number(item.value) > 0) ||
    payload.medicines.length > 0 ||
    payload.reservations.length > 0 ||
    payload.users.length > 0;

  return (
    <AdminLayout title="Analitika" subtitle="Sistem statistikaları və trendlər">
      {loading ? (
        <section className="admin-empty-state">Yüklənir...</section>
      ) : error ? (
        <section className="admin-empty-state admin-empty-state--error">{error}</section>
      ) : !hasData ? (
        <section className="admin-empty-state">Analitika üçün kifayət qədər məlumat yoxdur</section>
      ) : (
        <>
          <section className="admin-metrics-grid">
            {derived.metrics.map((item) => (
              <MetricCard key={item.label} {...item} />
            ))}
          </section>

          <section className="admin-charts-grid">
            <article className="admin-panel-card">
              <div className="admin-panel-card__head">
                <h3>Aylıq Rezervasiya Statistikası</h3>
              </div>
              <div className="admin-line-chart">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <polyline points={linePoints} />
                </svg>
                <div className="admin-chart-labels">
                  {derived.reservationBuckets.map((item) => (
                    <span key={item.key}>{item.label}</span>
                  ))}
                </div>
              </div>
            </article>

            <article className="admin-panel-card">
              <div className="admin-panel-card__head">
                <h3>İstifadəçi Artımı</h3>
              </div>
              <div className="admin-bar-chart">
                {derived.userBuckets.map((item) => (
                  <div key={item.key} className="admin-bar-chart__item">
                    <span style={{ height: `${Math.max(18, (item.value / maxBarValue) * 180)}px` }} />
                  </div>
                ))}
              </div>
              <div className="admin-chart-labels">
                {derived.userBuckets.map((item) => (
                  <span key={item.key}>{item.label}</span>
                ))}
              </div>
            </article>
          </section>

          <section className="admin-panels-grid">
            <RankingList
              title="Ən Çox Rezervasiya Edilən Dərmanlar"
              icon="fa-solid fa-capsules"
              items={derived.topMedicines}
              itemLabel={(item) => `${item.count} rezervasiya`}
            />

            <RankingList
              title="Ən Populyar Apteklər"
              icon="fa-regular fa-hospital"
              items={derived.topPharmacies}
              itemLabel={(item) => `${item.count} rezervasiya`}
            />
          </section>

          <section className="admin-panel-card admin-pie-card">
            <div className="admin-panel-card__head">
              <h3>Dərman Kateqoriyaları Bölgüsü</h3>
            </div>

            {derived.categories.length === 0 ? (
              <div className="admin-empty-inline">Kateqoriya məlumatı yoxdur</div>
            ) : (
              <div className="admin-pie-card__content">
                <div className="admin-pie-chart" style={{ background: pieBackground }} aria-hidden="true"></div>

                <div className="admin-pie-legend">
                  {derived.categories.map((item) => (
                    <div key={item.name} className="admin-pie-legend__item">
                      <span className="admin-pie-legend__swatch" style={{ background: item.color }} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </AdminLayout>
  );
}
