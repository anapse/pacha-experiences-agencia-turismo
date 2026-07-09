import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './AdminCalendar.module.css';

const MOCK_BOOKINGS_BY_DAY = [
  { day: 1, count: 3, revenue: 850, clients: 8 },
  { day: 3, count: 5, revenue: 1420, clients: 14 },
  { day: 5, count: 2, revenue: 560, clients: 5 },
  { day: 7, count: 4, revenue: 1100, clients: 11 },
  { day: 10, count: 6, revenue: 1780, clients: 17 },
  { day: 12, count: 3, revenue: 920, clients: 9 },
  { day: 15, count: 7, revenue: 2100, clients: 20 },
  { day: 18, count: 4, revenue: 1150, clients: 12 },
  { day: 20, count: 5, revenue: 1480, clients: 14 },
  { day: 22, count: 3, revenue: 890, clients: 7 },
  { day: 25, count: 6, revenue: 1890, clients: 16 },
  { day: 28, count: 4, revenue: 1250, clients: 10 },
  { day: 30, count: 2, revenue: 450, clients: 4 },
];

const MOCK_DAY_DETAIL = [
  { id: 1, client: 'María García', experience: 'City Tour Histórico', time: '09:00', persons: 3, amount: 450 },
  { id: 2, client: 'Carlos López', experience: 'Aventura en Montaña', time: '10:30', persons: 2, amount: 320 },
  { id: 3, client: 'Ana Martínez', experience: 'Tour Gastronómico', time: '14:00', persons: 4, amount: 580 },
  { id: 4, client: 'Pedro Sánchez', experience: 'City Tour Histórico', time: '09:00', persons: 2, amount: 210 },
];

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export default function AdminCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [bookingsByDay, setBookingsByDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetail, setDayDetail] = useState([]);

  useEffect(() => {
    api.get('/admin/calendar', { params: { year, month: month + 1 } })
      .then(res => setBookingsByDay(res.data.data))
      .catch(() => setBookingsByDay(MOCK_BOOKINGS_BY_DAY))
      .finally(() => setLoading(false));
  }, [year, month]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    api.get('/admin/calendar/day', { params: { year, month: month + 1, day } })
      .then(res => setDayDetail(res.data.data))
      .catch(() => setDayDetail(MOCK_DAY_DETAIL));
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const { firstDay, daysInMonth } = getMonthDays(year, month);
  const getDayData = (day) => bookingsByDay.find(b => b.day === day);

  if (loading) return <div className={styles.loading}>Cargando calendario...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendario</h1>
          <p className={styles.subtitle}>Visualiza las reservas por día</p>
        </div>
      </header>

      <div className={styles.calendarLayout}>
        <div className={styles.calendarSection}>
          {/* Month navigation */}
          <div className={styles.monthNav}>
            <button className={styles.navBtn} onClick={prevMonth}>←</button>
            <span className={styles.monthTitle}>{MONTHS[month]} {year}</span>
            <button className={styles.navBtn} onClick={nextMonth}>→</button>
          </div>

          {/* Day headers */}
          <div className={styles.dayHeaders}>
            {DAYS.map(d => (
              <span key={d} className={styles.dayHeader}>{d}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={styles.grid}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptyDay} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const data = getDayData(day);
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
              const isSelected = day === selectedDay;
              return (
                <div
                  key={day}
                  className={`${styles.dayCell} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''} ${data ? styles.hasData : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className={styles.dayNumber}>{day}</span>
                  {data && (
                    <div className={styles.daySummary}>
                      <span className={styles.dayCount}>{data.count} res.</span>
                      <span className={styles.dayRevenue}>S/ {data.revenue}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDay && (
          <div className={styles.detailPanel}>
            <h3 className={styles.detailTitle}>
              Reservas del {selectedDay} de {MONTHS[month]} {year}
            </h3>
            {dayDetail.length === 0 ? (
              <p className={styles.detailEmpty}>No hay reservas este día</p>
            ) : (
              <div className={styles.detailList}>
                {dayDetail.map(b => (
                  <div key={b.id} className={styles.detailItem}>
                    <div className={styles.detailItemHeader}>
                      <span className={styles.detailClient}>{b.client}</span>
                      <span className={styles.detailAmount}>S/ {b.amount}</span>
                    </div>
                    <span className={styles.detailExperience}>{b.experience}</span>
                    <div className={styles.detailMeta}>
                      <span>⏰ {b.time}</span>
                      <span>👥 {b.persons} pers.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
