import { useState, useEffect } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { api } from '../../services/api';
import styles from './Vehicles.module.css';

const MOCK_VEHICLES = [
  { id: 1, name: 'Toyota Hiace', plate: 'ABC-123', type: 'Van', capacity: 12, status: 'active' },
  { id: 2, name: 'Mercedes Sprinter', plate: 'DEF-456', type: 'Minibús', capacity: 20, status: 'active' },
  { id: 3, name: 'Ford Transit', plate: 'GHI-789', type: 'Van', capacity: 15, status: 'active' },
  { id: 4, name: 'Nissan Urvan', plate: 'JKL-012', type: 'Van', capacity: 12, status: 'maintenance' },
  { id: 5, name: 'Toyota Hiace', plate: 'MNO-345', type: 'Van', capacity: 12, status: 'active' },
  { id: 6, name: 'Mercedes Sprinter', plate: 'PQR-678', type: 'Minibús', capacity: 20, status: 'active' },
  { id: 7, name: 'Ford Transit', plate: 'STU-901', type: 'Van', capacity: 15, status: 'inactive' },
  { id: 8, name: 'Volkswagen Crafter', plate: 'VWX-234', type: 'Minibús', capacity: 18, status: 'maintenance' },
];

const STATUS_LABELS = {
  active: 'Activo',
  inactive: 'Inactivo',
  maintenance: 'Mantenimiento',
};

export default function Vehicles() {
  const { t } = useTranslate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/vehicles')
      .then(res => setVehicles(res.data.data))
      .catch(() => setVehicles(MOCK_VEHICLES))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>{t('admin.loading') || 'Cargando...'}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.vehicles.title') || 'Vehículos'}</h1>
          <p className={styles.subtitle}>{t('admin.vehicles.subtitle') || 'Gestiona la flota de vehículos disponibles'}</p>
        </div>
        <button className={styles.addButton}>
          + {t('admin.vehicles.add') || 'Nuevo Vehículo'}
        </button>
      </header>

      {vehicles.length === 0 ? (
        <p className={styles.empty}>{t('admin.vehicles.empty') || 'No hay vehículos registrados'}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>{t('admin.vehicles.name') || 'Nombre'}</span>
              <span>{t('admin.vehicles.plate') || 'Placa'}</span>
              <span>{t('admin.vehicles.type') || 'Tipo'}</span>
              <span>{t('admin.vehicles.capacity') || 'Capacidad'}</span>
              <span>{t('admin.vehicles.status') || 'Estado'}</span>
              <span className={styles.actionsHeader}>{t('admin.actions') || 'Acciones'}</span>
            </div>
            {vehicles.map(v => (
              <div key={v.id} className={styles.tableRow}>
                <span className={styles.cellName}>{v.name}</span>
                <span className={styles.cellPlate}>{v.plate}</span>
                <span>{v.type}</span>
                <span className={styles.cellCapacity}>{v.capacity} asientos</span>
                <span>
                  <span className={`${styles.status} ${styles[`status--${v.status}`]}`}>
                    {STATUS_LABELS[v.status] || v.status}
                  </span>
                </span>
                <span className={styles.actions}>
                  <button className={styles.actionBtn} title="Ver">👁️</button>
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
