import { useState, useEffect } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { api } from '../../services/api';
import styles from './Products.module.css';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Fotografía Profesional', description: 'Set de fotos profesionales durante la experiencia', price: 50, category: 'fotografía', status: 'active' },
  { id: 2, name: 'Video Drone', description: 'Grabación aérea con drone de toda la experiencia', price: 80, category: 'video', status: 'active' },
  { id: 3, name: 'Almuerzo Campestre', description: 'Almuerzo típico preparado por locales', price: 25, category: 'alimentación', status: 'active' },
  { id: 4, name: 'Traslado Hotel', description: 'Recojo y retorno desde el hotel', price: 35, category: 'transporte', status: 'active' },
  { id: 5, name: 'Seguro de Viaje', description: 'Seguro de accidentes personales para el día', price: 15, category: 'seguros', status: 'active' },
  { id: 6, name: 'Cena Romántica', description: 'Cena especial al atardecer preparada por chef', price: 90, category: 'alimentación', status: 'active' },
  { id: 7, name: 'Tour en Bicicleta', description: 'Recorrido adicional en bicicleta por la zona', price: 40, category: 'actividades', status: 'inactive' },
  { id: 8, name: 'Guía en Inglés', description: 'Guía especializado con dominio del inglés', price: 30, category: 'guias', status: 'active' },
];

const CATEGORY_LABELS = {
  fotografía: 'Fotografía',
  video: 'Video',
  alimentación: 'Alimentación',
  transporte: 'Transporte',
  seguros: 'Seguros',
  actividades: 'Actividades',
  guias: 'Guías',
};

export default function Products() {
  const { t } = useTranslate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/products')
      .then(res => setProducts(res.data.data))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>{t('admin.loading') || 'Cargando...'}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.products.title') || 'Servicios Adicionales'}</h1>
          <p className={styles.subtitle}>{t('admin.products.subtitle') || 'Catálogo de servicios y productos adicionales'}</p>
        </div>
        <button className={styles.addButton}>
          + {t('admin.products.add') || 'Nuevo Servicio'}
        </button>
      </header>

      {products.length === 0 ? (
        <p className={styles.empty}>{t('admin.products.empty') || 'No hay servicios registrados'}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>{t('admin.products.name') || 'Nombre'}</span>
              <span>{t('admin.products.description') || 'Descripción'}</span>
              <span>{t('admin.products.price') || 'Precio'}</span>
              <span>{t('admin.products.category') || 'Categoría'}</span>
              <span>{t('admin.products.status') || 'Estado'}</span>
              <span className={styles.actionsHeader}>{t('admin.actions') || 'Acciones'}</span>
            </div>
            {products.map(p => (
              <div key={p.id} className={styles.tableRow}>
                <span className={styles.cellName}>{p.name}</span>
                <span className={styles.cellDesc}>{p.description}</span>
                <span className={styles.cellPrice}>S/ {p.price.toFixed(2)}</span>
                <span>
                  <span className={styles.category}>
                    {CATEGORY_LABELS[p.category] || p.category}
                  </span>
                </span>
                <span>
                  <span className={`${styles.status} ${styles[`status--${p.status}`]}`}>
                    {p.status === 'active' ? 'Activo' : 'Inactivo'}
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
