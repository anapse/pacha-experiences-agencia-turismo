import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './Users.module.css';

const MOCK_USERS = [
  { id: 1, name: 'Admin Principal', email: 'admin@pachaexperiences.com', role: 'admin', status: 'active', last_access: '2025-07-06 09:15' },
  { id: 2, name: 'Carlos Mendoza', email: 'carlos@pachaexperiences.com', role: 'editor', status: 'active', last_access: '2025-07-06 08:30' },
  { id: 3, name: 'María Rivas', email: 'maria@pachaexperiences.com', role: 'editor', status: 'active', last_access: '2025-07-05 16:45' },
  { id: 4, name: 'Juan Torres', email: 'juan@pachaexperiences.com', role: 'support', status: 'active', last_access: '2025-07-05 14:00' },
  { id: 5, name: 'Lucía Fernández', email: 'lucia@pachaexperiences.com', role: 'support', status: 'inactive', last_access: '2025-06-20 11:10' },
  { id: 6, name: 'Pedro Castillo', email: 'pedro@pachaexperiences.com', role: 'viewer', status: 'active', last_access: '2025-07-04 10:25' },
  { id: 7, name: 'Ana Lucía Vega', email: 'ana@pachaexperiences.com', role: 'viewer', status: 'inactive', last_access: '2025-06-15 09:00' },
  { id: 8, name: 'Diego Paredes', email: 'diego@pachaexperiences.com', role: 'editor', status: 'active', last_access: '2025-07-06 07:55' },
];

const roleLabels = {
  admin: 'Admin',
  editor: 'Editor',
  support: 'Soporte',
  viewer: 'Visor',
};

const statusLabels = {
  active: 'Activo',
  inactive: 'Inactivo',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data.data))
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const handleEditRole = (user) => {
    alert(`Editar rol de ${user.name} (actual: ${roleLabels[user.role]})`);
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
  };

  if (loading) return <div className={styles.loading}>Cargando usuarios...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>Administra los usuarios del sistema</p>
        </div>
        <button className={styles.addBtn}>+ Nuevo usuario</button>
      </header>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Nombre</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Estado</span>
          <span>Último acceso</span>
          <span>Acciones</span>
        </div>
        {users.map(user => (
          <div key={user.id} className={styles.tableRow}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userEmail}>{user.email}</span>
            <span>
              <span className={`${styles.roleBadge} ${styles[`role--${user.role}`]}`}>
                {roleLabels[user.role]}
              </span>
            </span>
            <span>
              <span className={`${styles.statusBadge} ${styles[`userStatus--${user.status}`]}`}>
                {statusLabels[user.status]}
              </span>
            </span>
            <span className={styles.lastAccess}>{user.last_access}</span>
            <span className={styles.actions}>
              <button className={styles.actionBtn} onClick={() => handleEditRole(user)}>
                Editar rol
              </button>
              <button
                className={`${styles.actionBtn} ${user.status === 'active' ? styles.dangerBtn : styles.successBtn}`}
                onClick={() => handleToggleStatus(user)}
              >
                {user.status === 'active' ? 'Desactivar' : 'Activar'}
              </button>
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <p className={styles.empty}>No hay usuarios registrados</p>
        )}
      </div>
    </div>
  );
}
