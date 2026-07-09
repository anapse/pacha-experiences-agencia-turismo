import { useState, useEffect } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { api } from '../../services/api';
import styles from './Operators.module.css';

const MOCK_OPERATORS = [
  { id: 1, name: 'José Luis Tovar', email: 'jose.tovar@example.com', phone: '+51 987 654 201', experience: 5, status: 'active' },
  { id: 2, name: 'Marco Antonio Silva', email: 'marco.silva@example.com', phone: '+51 987 654 202', experience: 3, status: 'active' },
  { id: 3, name: 'César Augusto Rojas', email: 'cesar.rojas@example.com', phone: '+51 987 654 203', experience: 8, status: 'active' },
  { id: 4, name: 'Daniel Quispe', email: 'daniel.quispe@example.com', phone: '+51 987 654 204', experience: 2, status: 'inactive' },
  { id: 5, name: 'Raúl Espinoza', email: 'raul.espinoza@example.com', phone: '+51 987 654 205', experience: 6, status: 'active' },
  { id: 6, name: 'Héctor Salazar', email: 'hector.salazar@example.com', phone: '+51 987 654 206', experience: 10, status: 'active' },
  { id: 7, name: 'Pablo Andrés Cárdenas', email: 'pablo.cardenas@example.com', phone: '+51 987 654 207', experience: 1, status: 'active' },
  { id: 8, name: 'Víctor Hugo Ramos', email: 'victor.ramos@example.com', phone: '+51 987 654 208', experience: 4, status: 'inactive' },
];

export default function Operators() {
  const { t } = useTranslate();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/operators')
      .then(res => setOperators(res.data.data))
      .catch(() => setOperators(MOCK_OPERATORS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.loading}>{t('admin.loading') || 'Cargando...'}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.operators.title') || 'Operadores'}</h1>
          <p className={styles.subtitle}>{t('admin.operators.subtitle') || 'Gestiona los operadores de tubulares y guías'}</p>
        </div>
        <button className={styles.addButton}>
          + {t('admin.operators.add') || 'Nuevo Operador'}
        </button>
      </header>

      {operators.length === 0 ? (
        <p className={styles.empty}>{t('admin.operators.empty') || 'No hay operadores registrados'}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>{t('admin.operators.name') || 'Nombre'}</span>
              <span>{t('admin.operators.email') || 'Email'}</span>
              <span>{t('admin.operators.phone') || 'Teléfono'}</span>
              <span>{t('admin.operators.experience') || 'Experiencia'}</span>
              <span>{t('admin.operators.status') || 'Estado'}</span>
              <span className={styles.actionsHeader}>{t('admin.actions') || 'Acciones'}</span>
            </div>
            {operators.map(op => (
              <div key={op.id} className={styles.tableRow}>
                <span className={styles.cellName}>{op.name}</span>
                <span className={styles.cellEmail}>{op.email}</span>
                <span>{op.phone}</span>
                <span className={styles.cellExperience}>{op.experience} años</span>
                <span>
                  <span className={`${styles.status} ${styles[`status--${op.status}`]}`}>
                    {op.status === 'active' ? 'Activo' : 'Inactivo'}
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
