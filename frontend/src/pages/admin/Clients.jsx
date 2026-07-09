import { useState, useEffect } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { api } from '../../services/api';
import styles from './Clients.module.css';

const MOCK_CLIENTS = [
  { id: 1, name: 'Carlos Mendoza', email: 'carlos@example.com', phone: '+51 987 654 321', visits: 12, last_visit: '2026-06-28', status: 'active' },
  { id: 2, name: 'María García', email: 'maria@example.com', phone: '+51 987 654 322', visits: 8, last_visit: '2026-07-01', status: 'active' },
  { id: 3, name: 'Juan Pérez', email: 'juan@example.com', phone: '+51 987 654 323', visits: 3, last_visit: '2026-05-15', status: 'active' },
  { id: 4, name: 'Ana Torres', email: 'ana@example.com', phone: '+51 987 654 324', visits: 20, last_visit: '2026-07-03', status: 'active' },
  { id: 5, name: 'Luis Fernández', email: 'luis@example.com', phone: '+51 987 654 325', visits: 1, last_visit: '2026-04-10', status: 'inactive' },
  { id: 6, name: 'Sofía Ramírez', email: 'sofia@example.com', phone: '+51 987 654 326', visits: 7, last_visit: '2026-06-20', status: 'active' },
  { id: 7, name: 'Diego Castillo', email: 'diego@example.com', phone: '+51 987 654 327', visits: 15, last_visit: '2026-07-04', status: 'active' },
  { id: 8, name: 'Valentina López', email: 'valentina@example.com', phone: '+51 987 654 328', visits: 0, last_visit: '—', status: 'inactive' },
];

export default function Clients() {
  const { t } = useTranslate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/clients')
      .then(res => setClients(res.data.data))
      .catch(() => setClients(MOCK_CLIENTS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>{t('admin.loading') || 'Cargando...'}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.clients.title') || 'Clientes'}</h1>
          <p className={styles.subtitle}>{t('admin.clients.subtitle') || 'Gestiona los clientes registrados en la plataforma'}</p>
        </div>
        <button className={styles.addButton}>
          + {t('admin.clients.add') || 'Nuevo Cliente'}
        </button>
      </header>

      {clients.length === 0 ? (
        <p className={styles.empty}>{t('admin.clients.empty') || 'No hay clientes registrados'}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>{t('admin.clients.name') || 'Nombre'}</span>
              <span>{t('admin.clients.email') || 'Email'}</span>
              <span>{t('admin.clients.phone') || 'Teléfono'}</span>
              <span>{t('admin.clients.visits') || 'Visitas'}</span>
              <span>{t('admin.clients.last_visit') || 'Última Visita'}</span>
              <span>{t('admin.clients.status') || 'Estado'}</span>
              <span className={styles.actionsHeader}>{t('admin.actions') || 'Acciones'}</span>
            </div>
            {clients.map(client => (
              <div key={client.id} className={styles.tableRow}>
                <span className={styles.cellName}>{client.name}</span>
                <span className={styles.cellEmail}>{client.email}</span>
                <span>{client.phone}</span>
                <span className={styles.cellVisits}>{client.visits}</span>
                <span>{client.last_visit}</span>
                <span>
                  <span className={`${styles.status} ${styles[`status--${client.status}`]}`}>
                    {client.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </span>
                <span className={styles.actions}>
                  <button className={styles.actionBtn} title="Ver perfil">👁️</button>
                  <button className={styles.actionBtn} title="Editar">✏️</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
