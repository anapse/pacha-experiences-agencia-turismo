import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './Reports.module.css';

const MOCK_REPORTS = {
  revenue_today: 2840.00,
  revenue_month: 48230.00,
  revenue_year: 389120.00,
  total_bookings: 156,
  new_clients: 23,
  avg_booking_value: 310.50,
  top_experience: 'City Tour Histórico',
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    api.get('/admin/reports', { params: { period } })
      .then(res => setData(res.data.data))
      .catch(() => setData(MOCK_REPORTS))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className={styles.loading}>Cargando reportes...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reportes</h1>
          <p className={styles.subtitle}>Visualiza el rendimiento del negocio</p>
        </div>
        <select
          className={styles.periodSelect}
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="year">Este año</option>
        </select>
      </header>

      <div className={styles.cardsRow}>
        <div className={styles.card}>
          <span className={styles.cardIcon}>💰</span>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>S/ {data.revenue_today.toFixed(2)}</span>
            <span className={styles.cardLabel}>Ingresos hoy</span>
          </div>
          <span className={`${styles.cardTrend} ${styles.up}`}>+12%</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>📊</span>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>S/ {data.revenue_month.toFixed(2)}</span>
            <span className={styles.cardLabel}>Ingresos este mes</span>
          </div>
          <span className={`${styles.cardTrend} ${styles.up}`}>+8%</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>📈</span>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>S/ {data.revenue_year.toFixed(2)}</span>
            <span className={styles.cardLabel}>Ingresos este año</span>
          </div>
          <span className={`${styles.cardTrend} ${styles.up}`}>+23%</span>
        </div>
      </div>

      <div className={styles.cardsRow}>
        <div className={styles.card}>
          <span className={styles.cardIcon}>📋</span>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>{data.total_bookings}</span>
            <span className={styles.cardLabel}>Reservas totales</span>
          </div>
          <span className={`${styles.cardTrend} ${styles.up}`}>+5%</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>👤</span>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>{data.new_clients}</span>
            <span className={styles.cardLabel}>Clientes nuevos</span>
          </div>
          <span className={`${styles.cardTrend} ${styles.up}`}>+18%</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>🎯</span>
          <div className={styles.cardBody}>
            <span className={styles.cardValue}>S/ {data.avg_booking_value.toFixed(2)}</span>
            <span className={styles.cardLabel}>Valor promedio</span>
          </div>
          <span className={`${styles.cardTrend} ${styles.down}`}>-2%</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Experiencia más popular</h2>
        <div className={styles.topCard}>
          <span className={styles.topIcon}>🏆</span>
          <div>
            <span className={styles.topName}>{data.top_experience}</span>
            <span className={styles.topLabel}>Mayor cantidad de reservas en el período</span>
          </div>
        </div>
      </section>
    </div>
  );
}
