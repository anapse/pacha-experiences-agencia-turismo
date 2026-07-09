import { Link, useLocation } from 'react-router-dom';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const { pathname } = useLocation();

  const items = [
    { path: '/', icon: '🏠', label: 'Inicio' },
    { path: '/experiencias', icon: '🏜️', label: 'Explorar' },
    { path: '/calendario', icon: '📅', label: 'Calendario' },
    { path: '/mi-reserva', icon: '🎫', label: 'Reserva' },
    { path: '/contacto', icon: '📞', label: 'Contacto' },
  ];

  return (
    <nav className={styles.nav}>
      {items.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`${styles.item} ${pathname === item.path ? styles.active : ''}`}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
