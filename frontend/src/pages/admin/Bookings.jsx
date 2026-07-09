import styles from './Bookings.module.css';

export default function Bookings() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reservas</h1>
        <p className={styles.subtitle}>Gestiona todas las reservas del sistema</p>
      </header>
      <p className={styles.placeholder}>Módulo de gestión de reservas disponible próximamente.</p>
    </div>
  );
}
