import { Link, useLocation, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ToastContainer from '../common/ToastContainer';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;

  const menu = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/experiencias', icon: '🏜️', label: 'Experiencias' },
    { path: '/admin/carrusel', icon: '🎠', label: 'Carrusel' },
    { path: '/admin/reservas', icon: '📋', label: 'Reservas' },
    { path: '/admin/clientes', icon: '👥', label: 'Clientes' },
    { path: '/admin/calendario', icon: '📅', label: 'Calendario' },
    { path: '/admin/conductores', icon: '🚗', label: 'Conductores' },
    { path: '/admin/operadores', icon: '👷', label: 'Operadores' },
    { path: '/admin/vehiculos', icon: '🚐', label: 'Vehículos' },
    { path: '/admin/productos', icon: '📦', label: 'Productos' },
    { path: '/admin/facturacion', icon: '💰', label: 'Facturación' },
    { path: '/admin/reportes', icon: '📈', label: 'Reportes' },
    { path: '/admin/usuarios', icon: '🔐', label: 'Usuarios' },
    { path: '/admin/configuracion', icon: '⚙️', label: 'Config' },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.logo}>✦ Pacha</Link>
        <nav className={styles.nav}>
          {menu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.menuItem} ${pathname === item.path ? styles.active : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.adminName}>{user?.name}</span>
          <button onClick={logout} className={styles.logoutBtn}>Salir</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
