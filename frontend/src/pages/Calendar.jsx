import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslate } from '../hooks/useTranslate';
import { api } from '../services/api';
import styles from './Calendar.module.css';

/* ── Mock data (fallback) ── */
const MOCK_EXPERIENCIAS = [
  {
    id: 1,
    nombre: 'Tubulares en Huacachina',
    horarios: ['10:00', '13:00', '15:30', '17:00'],
    duracion: '30 min',
    cupoTotal: 20,
  },
  {
    id: 2,
    nombre: 'Tubulares + Sandboard',
    horarios: ['10:00', '13:00', '15:30'],
    duracion: '45 min',
    cupoTotal: 16,
  },
  {
    id: 3,
    nombre: 'Pack Romance Atardecer',
    horarios: ['16:30', '18:00'],
    duracion: '1.5 h',
    cupoTotal: 8,
  },
];

/* ── Mock status generators (fallback) ── */
function getDayStatus(day) {
  if (day < 1 || day > 31) return null;
  const mod = day % 7;
  if (mod === 0 || mod === 6) return 'soldOut';
  if (mod === 1 || mod === 2) return 'few';
  return 'available';
}

function getExperienceStatus(day, expIdx) {
  const combined = day + expIdx * 7;
  const mod = combined % 5;
  if (mod === 0) return 'soldOut';
  if (mod === 1) return 'few';
  return 'available';
}

function getCuposRestantes(day, expIdx, total) {
  const status = getExperienceStatus(day, expIdx);
  if (status === 'available') return Math.floor(total * (0.4 + Math.random() * 0.5));
  if (status === 'few') return Math.floor(Math.random() * 3) + 1;
  return 0;
}

function formatDateShort(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/* ── Helper para determinar disponibilidad global del día ── */
function getOverallDayStatus(experiencias) {
  if (!experiencias || experiencias.length === 0) return null;
  let hasAvailable = false;
  let hasFew = false;
  for (const exp of experiencias) {
    for (const sched of exp.schedules || []) {
      if (sched.status !== 'cancelled') {
        if (sched.available_spots > 3) hasAvailable = true;
        else if (sched.available_spots > 0) hasFew = true;
      }
    }
  }
  if (hasAvailable) return 'available';
  if (hasFew) return 'few';
  return 'soldOut';
}

export default function Calendar() {
  const { t, lang } = useTranslate();
  const today = useMemo(() => new Date(), []);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Estado para datos reales: mapa { 'YYYY-MM-DD': experiencias[] }
  const [scheduleCache, setScheduleCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  /* ── Navegación entre meses ── */
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  /* ── Fetch schedules for all days in the current month ── */
  useEffect(() => {
    if (useMock) return;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Fetch each day's schedules, but batch them
    const fetchMonthSchedules = async () => {
      setLoading(true);
      const newCache = { ...scheduleCache };
      let fetchError = false;

      const promises = [];
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateStr = `${currentYear}-${String(d).padStart(2, '0')}-${String(currentMonth + 1).padStart(2, '0')}`;
        if (!newCache[dateStr]) {
          promises.push(
            api.get(`/schedules/by-date/${dateStr}`)
              .then(res => {
                newCache[dateStr] = res.data.data || [];
              })
              .catch(() => {
                fetchError = true;
              })
          );
        }
      }

      await Promise.allSettled(promises);

      if (fetchError && Object.keys(newCache).length === 0) {
        // Si falló todo y no hay cache previo, usar mock
        setUseMock(true);
      }

      setScheduleCache({ ...newCache });
      setLoading(false);
    };

    fetchMonthSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth]);

  /* ── Build calendar grid ── */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay(); // 0=domingo

    const days = [];

    // Empty cells before the 1st
    for (let i = 0; i < startWeekday; i++) {
      days.push({ day: null, otherMonth: true });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateStr = formatDateShort(date);
      const dayExperiencias = scheduleCache[dateStr];

      let status;
      if (useMock) {
        status = getDayStatus(d);
      } else if (dayExperiencias) {
        status = getOverallDayStatus(dayExperiencias);
      } else {
        status = loading ? null : 'soldOut'; // si no hay datos, mostrar como agotado
      }

      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      days.push({
        day: d,
        date,
        status,
        otherMonth: false,
        isToday,
        hasData: !!dayExperiencias,
      });
    }

    // Fill remaining cells
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 0; i < remaining; i++) {
        days.push({ day: null, otherMonth: true });
      }
    }

    return days;
  }, [currentYear, currentMonth, today, scheduleCache, useMock, loading]);

  /* ── Experiences for selected day ── */
  const dayExperiences = useMemo(() => {
    if (!selectedDate) return [];

    const dateStr = formatDateShort(selectedDate);

    if (!useMock && scheduleCache[dateStr]) {
      // Datos reales - transformar al formato que espera el panel
      return scheduleCache[dateStr].map((exp) => {
        const totalSchedules = exp.schedules?.length || 0;
        const totalBooked = exp.schedules?.reduce((sum, s) => sum + s.current_bookings, 0) || 0;
        const totalCapacity = exp.schedules?.reduce((sum, s) => sum + s.max_capacity, 0) || 0;
        const totalAvailable = exp.schedules?.reduce((sum, s) => sum + s.available_spots, 0) || 0;

        let status = 'soldOut';
        if (totalAvailable > 3) status = 'available';
        else if (totalAvailable > 0) status = 'few';

        return {
          id: exp.id,
          nombre: exp.name,
          slug: exp.slug,
          horarios: exp.schedules?.map((s) => s.time) || [],
          duracion: exp.duration || '—',
          cupoTotal: totalCapacity,
          cuposRestantes: totalAvailable,
          current_bookings: totalBooked,
          schedules: exp.schedules || [],
          status,
        };
      });
    }

    // Mock data fallback
    const day = selectedDate.getDate();
    return MOCK_EXPERIENCIAS.map((exp) => {
      const status = getExperienceStatus(day, exp.id);
      const cuposRestantes = getCuposRestantes(day, exp.id, exp.cupoTotal);
      return {
        ...exp,
        status,
        cuposRestantes,
      };
    });
  }, [selectedDate, scheduleCache, useMock]);

  /* ── Handle day click ── */
  const handleDayClick = useCallback((dayObj) => {
    if (!dayObj.day || dayObj.otherMonth) return;
    if (dayObj.status === 'soldOut') return;
    setSelectedDate(dayObj.date);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setTimeout(() => setSelectedDate(null), 300);
  }, []);

  /* ── Cerrar con Escape ── */
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClosePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, handleClosePanel]);

  /* ── Traducir weekday ── */
  const weekdays = useMemo(() => {
    if (lang === 'es') return WEEKDAYS;
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  }, [lang]);

  const statusLabelKey = useCallback(
    (status) => {
      const map = {
        available: 'calendar.disponible',
        few: 'calendar.pocos',
        soldOut: 'calendar.agotado',
      };
      return t(map[status] || 'calendar.proximamente');
    },
    [t]
  );

  const monthLabel = useMemo(
    () =>
      lang === 'es'
        ? MONTHS[currentMonth]
        : new Date(currentYear, currentMonth).toLocaleString('en', { month: 'long' }),
    [currentMonth, lang]
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t('calendar.title')}</h1>
          <p className={styles.subtitle}>{t('calendar.subtitle')}</p>
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendDotAvailable}`} />
            {t('calendar.disponible')}
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendDotFew}`} />
            {t('calendar.pocos')}
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendDotSoldOut}`} />
            {t('calendar.agotado')}
          </span>
        </div>

        {/* Month Navigation */}
        <div className={styles.calendarNav}>
          <button
            className={styles.navBtn}
            onClick={goToPrevMonth}
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className={styles.monthLabel}>
            {monthLabel} {currentYear}
          </span>
          <button
            className={styles.navBtn}
            onClick={goToNextMonth}
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        {/* Weekday Headers */}
        <div className={styles.weekdays}>
          {weekdays.map((wd) => (
            <div key={wd} className={styles.weekday}>
              {wd}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={styles.daysGrid}>
          {calendarDays.map((dayObj, idx) => {
            if (dayObj.otherMonth) {
              return (
                <div key={`empty-${idx}`} className={`${styles.dayCell} ${styles.dayCellEmpty}`} />
              );
            }

            const isSelected =
              selectedDate &&
              dayObj.date &&
              formatDateShort(dayObj.date) === formatDateShort(selectedDate);

            let statusClass = '';
            let dotClass = '';
            if (dayObj.status === 'available') {
              statusClass = styles.dayCellAvailable;
              dotClass = styles.dotAvailable;
            } else if (dayObj.status === 'few') {
              statusClass = styles.dayCellFew;
              dotClass = styles.dotFew;
            } else if (dayObj.status === 'soldOut') {
              statusClass = styles.dayCellSoldOut;
              dotClass = styles.dotSoldOut;
            }

            const classNames = [
              styles.dayCell,
              statusClass,
              dayObj.isToday && styles.dayCellToday,
              isSelected && styles.dayCellSelected,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={dayObj.day}
                className={classNames}
                onClick={() => handleDayClick(dayObj)}
                disabled={dayObj.status === 'soldOut'}
                aria-label={`${dayObj.day} - ${statusLabelKey(dayObj.status)}`}
              >
                <span className={styles.dayNumber}>{dayObj.day}</span>
                {dayObj.status && (
                  <span className={`${styles.dayStatusDot} ${dotClass}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Side Panel ── */}
      {panelOpen && selectedDate && (
        <>
          <div className={styles.overlay} onClick={handleClosePanel} />
          <div className={styles.panel} role="dialog" aria-label="Detalles de fecha">
            <div className={styles.panelHeader}>
              <span className={styles.panelDate}>
                {lang === 'es'
                  ? selectedDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : selectedDate.toLocaleDateString('en', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
              </span>
              <button
                className={styles.panelClose}
                onClick={handleClosePanel}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className={styles.panelBody}>
              {dayExperiences.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📅</span>
                  <p className={styles.emptyText}>{t('calendar.sin_experiencias')}</p>
                </div>
              ) : (
                dayExperiences.map((exp) => {
                  const isSoldOut = exp.status === 'soldOut';
                  const statusClass =
                    exp.status === 'available'
                      ? styles.expStatusAvailable
                      : exp.status === 'few'
                        ? styles.expStatusFew
                        : styles.expStatusSoldOut;

                  return (
                    <div key={exp.id} className={styles.expCard}>
                      <div className={styles.expHeader}>
                        <span className={styles.expTitle}>{exp.nombre}</span>
                        <span className={`${styles.expStatus} ${statusClass}`}>
                          {statusLabelKey(exp.status)}
                        </span>
                      </div>

                      <div className={styles.expMeta}>
                        <span className={styles.expMetaItem}>
                          <span className={styles.expMetaIcon}>🕐</span>
                          {exp.horarios.join(' · ')}
                        </span>
                        <span className={styles.expMetaItem}>
                          <span className={styles.expMetaIcon}>⏱</span>
                          {t('detail.duracion')}: {exp.duracion}
                        </span>
                        <span className={styles.expMetaItem}>
                          <span className={styles.expMetaIcon}>👥</span>
                          {exp.cuposRestantes} / {exp.cupoTotal} {t('calendar.cupos')}
                        </span>
                      </div>

                      <div className={styles.expActions}>
                        <button
                          className={styles.btnElegir}
                          disabled={isSoldOut}
                          onClick={() => {
                            /* Aquí iría la navegación a detalle de experiencia */
                          }}
                        >
                          {t('calendar.elegir')}
                        </button>
                        <button
                          className={styles.btnContinuar}
                          disabled={isSoldOut}
                          onClick={() => {
                            /* Aquí iría navegación a /booking con fecha y experiencia */
                          }}
                        >
                          {t('calendar.continuar')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles.panelFooter}>
              <p className={styles.footerNote}>
                {t('experiences.disponibles')} · {dayExperiences.filter((e) => e.status !== 'soldOut').length}{' '}
                {t('experiences.disponibles')}
                {useMock && (
                  <span style={{ marginLeft: 8, opacity: 0.5, fontSize: '0.8em' }}>
                    (demo)
                  </span>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
