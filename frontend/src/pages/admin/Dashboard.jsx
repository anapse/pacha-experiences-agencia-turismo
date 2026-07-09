import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './Dashboard.module.css';

const MOCK_STATS = {
  activeUsers: 0,
  totalVisits: 0,
  todayVisits: 0,
  todayUnique: 0,
  last7days: []
};

const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/stats/summary')
      .then(res => setStats(res.data))
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setStatsLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Cargando dashboard...</div>;

  const maxVisits = stats?.last7days?.length
    ? Math.max(...stats.last7days.map(d => d.visits), 1)
    : 1;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resumen del día de hoy</p>
      </header>

      {/* Estadísticas en vivo */}
      {!statsLoading && (
        <section className={styles.liveStats}>
          <h2 className={styles.sectionTitle}>📊 Estadísticas en vivo</h2>

          <div className={styles.liveGrid}>
            {/* Tarjeta grande: usuarios activos */}
            <div className={styles.liveCardLarge}>
              <span className={styles.liveIcon}>👥</span>
              <span className={styles.liveNumber}>{stats?.activeUsers ?? 0}</span>
              <span className={styles.liveLabel}>Usuarios activos ahora</span>
            </div>

            {/* 3 tarjetas pequeñas */}
            <div className={styles.liveCardSmall}>
              <span className={styles.liveIcon}>👁️</span>
              <span className={styles.liveNumber}>{stats?.totalVisits ?? 0}</span>
              <span className={styles.liveLabel}>Visitas totales</span>
            </div>
            <div className={styles.liveCardSmall}>
              <span className={styles.liveIcon}>📅</span>
              <span className={styles.liveNumber}>{stats?.todayVisits ?? 0}</span>
              <span className={styles.liveLabel}>Visitas hoy</span>
            </div>
            <div className={styles.liveCardSmall}>
              <span className={styles.liveIcon}>👤</span>
              <span className={styles.liveNumber}>{stats?.todayUnique ?? 0}</span>
              <span className={styles.liveLabel}>Visitantes únicos hoy</span>
            </div>
          </div>

          {/* Gráfico últimos 7 días */}
          {stats?.last7days?.length > 0 && (
            <div className={styles.chart}>
              <h3 className={styles.chartTitle}>Últimos 7 días</h3>
              <div className={styles.chartBars}>
                {stats.last7days.map((day, i) => {
                  const date = new Date(day.date + 'T00:00:00');
                  const dayLabel = date.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
                  const heightPct = Math.max((day.visits / maxVisits) * 100, 4);
                  return (
                    <div key={day.date} className={styles.chartCol}>
                      <span className={styles.chartValue}>{day.visits}</span>
                      <div
                        className={styles.chartBar}
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                        }}
                      />
                      <span className={styles.chartDay}>{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Stats cards existentes */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📋</span>
          <div>
            <span className={styles.statNumber}>{data?.total_bookings_today}</span>
            <span className={styles.statLabel}>Reservas hoy</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>💰</span>
          <div>
            <span className={styles.statNumber}>S/ {data?.total_revenue_today}</span>
            <span className={styles.statLabel}>Ingresos hoy</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏳</span>
          <div>
            <span className={styles.statNumber}>{data?.pending_bookings}</span>
            <span className={styles.statLabel}>Pendientes</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🚨</span>
          <div>
            <span className={styles.statNumber}>{data?.active_emergencies}</span>
            <span className={styles.statLabel}>Emergencias</span>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Próximas Salidas</h2>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Experiencia</span>
            <span>Fecha</span>
            <span>Hora</span>
            <span>Cupos</span>
            <span>Estado</span>
          </div>
          {data?.upcoming_schedules?.map(s => (
            <div key={s.id} className={styles.tableRow}>
              <span>{s.experience_name || '—'}</span>
              <span>{s.date}</span>
              <span>{s.time}</span>
              <span>{s.current_bookings}/{s.max_capacity}</span>
              <span className={`${styles.status} ${styles[`status--${s.status}`]}`}>
                {s.status}
              </span>
            </div>
          ))}
          {(!data?.upcoming_schedules || data.upcoming_schedules.length === 0) && (
            <p className={styles.empty}>No hay salidas próximas</p>
          )}
        </div>
      </section>
    </div>
  );
}
