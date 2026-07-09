import { useState, useEffect } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { api } from '../../services/api';
import styles from './Drivers.module.css';

const VEHICLES = [
  'Camioneta 1', 'Camioneta 2', 'Van 1', 'Van 2',
  'Bus 1', 'Toyota Hiace', 'Mercedes Sprinter',
  'Ford Transit', 'Nissan Urvan',
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible' },
  { value: 'on_trip', label: 'En viaje' },
  { value: 'rest', label: 'Descanso' },
  { value: 'unavailable', label: 'No disponible' },
];

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s.label]));

const getLicenseBadge = (expiry) => {
  if (!expiry) return null;
  const today = new Date();
  const exp = new Date(expiry);
  const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { type: 'expired', label: 'Vencida' };
  if (diff <= 30) return { type: 'expiring', label: `Vence en ${diff} día${diff === 1 ? '' : 's'}` };
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const INITIAL_FORM = {
  name: '', email: '', phone: '', whatsapp: '',
  license: '', licenseExpiry: '',
  emergencyContact: '', vehicle: VEHICLES[0],
  status: 'available', trips: 0,
};

const MOCK_DRIVERS = [
  {
    id: 1, name: 'Roberto Sánchez', email: 'roberto@example.com',
    phone: '+51 987 654 101', whatsapp: '+51987654101',
    license: 'Q12345678', licenseExpiry: '2026-08-15',
    photo: null, emergencyContact: 'María Sánchez — +51 987 654 901',
    vehicle: 'Camioneta 1', status: 'available', trips: 145,
  },
  {
    id: 2, name: 'Jorge Paredes', email: 'jorge@example.com',
    phone: '+51 987 654 102', whatsapp: '+51987654102',
    license: 'Q23456789', licenseExpiry: '2024-12-01',
    photo: null, emergencyContact: 'Ana Paredes — +51 987 654 902',
    vehicle: 'Van 1', status: 'on_trip', trips: 212,
  },
  {
    id: 3, name: 'Miguel Ángel Ríos', email: 'miguel@example.com',
    phone: '+51 987 654 103', whatsapp: '+51987654103',
    license: 'Q34567890', licenseExpiry: '2025-03-20',
    photo: null, emergencyContact: 'Lucía Ríos — +51 987 654 903',
    vehicle: 'Mercedes Sprinter', status: 'available', trips: 89,
  },
  {
    id: 4, name: 'Pedro Guzmán', email: 'pedro@example.com',
    phone: '+51 987 654 104', whatsapp: '+51987654104',
    license: 'Q45678901', licenseExpiry: '2025-11-10',
    photo: null, emergencyContact: 'Rosa Guzmán — +51 987 654 904',
    vehicle: 'Nissan Urvan', status: 'on_trip', trips: 67,
  },
  {
    id: 5, name: 'Luis Alberto Vega', email: 'luis.vega@example.com',
    phone: '+51 987 654 105', whatsapp: '+51987654105',
    license: 'Q56789012', licenseExpiry: '2024-09-05',
    photo: null, emergencyContact: 'Carmen Vega — +51 987 654 905',
    vehicle: 'Camioneta 2', status: 'rest', trips: 310,
  },
  {
    id: 6, name: 'Carlos Huamán', email: 'carlos.h@example.com',
    phone: '+51 987 654 106', whatsapp: '+51987654106',
    license: 'Q67890123', licenseExpiry: '2027-01-15',
    photo: null, emergencyContact: 'Juana Huamán — +51 987 654 906',
    vehicle: 'Van 2', status: 'available', trips: 178,
  },
  {
    id: 7, name: 'Fernando Tapia', email: 'fernando@example.com',
    phone: '+51 987 654 107', whatsapp: '+51987654107',
    license: 'Q78901234', licenseExpiry: '2026-06-30',
    photo: null, emergencyContact: 'Diana Tapia — +51 987 654 907',
    vehicle: 'Bus 1', status: 'unavailable', trips: 54,
  },
];

export default function Drivers() {
  const { t } = useTranslate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    api.get('/admin/drivers')
      .then(res => setDrivers(res.data.data))
      .catch(() => setDrivers(MOCK_DRIVERS))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEdit = (driver) => {
    setEditingId(driver.id);
    setForm({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      whatsapp: driver.whatsapp || '',
      license: driver.license || '',
      licenseExpiry: driver.licenseExpiry || '',
      emergencyContact: driver.emergencyContact || '',
      vehicle: driver.vehicle,
      status: driver.status,
      trips: driver.trips || 0,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    setDrivers(prev => {
      if (editingId) {
        return prev.map(d =>
          d.id === editingId
            ? { ...d, ...form, id: editingId }
            : d
        );
      }
      const newId = Math.max(...prev.map(d => d.id), 0) + 1;
      return [...prev, { ...form, id: newId, photo: null }];
    });
    closeModal();
  };

  if (loading) {
    return <div className={styles.loading}>{t('admin.loading') || 'Cargando...'}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.drivers.title') || 'Conductores'}</h1>
          <p className={styles.subtitle}>{t('admin.drivers.subtitle') || 'Gestiona los conductores y su disponibilidad'}</p>
        </div>
        <button className={styles.addButton} onClick={openNew}>
          + {t('admin.drivers.add') || 'Nuevo Conductor'}
        </button>
      </header>

      {drivers.length === 0 ? (
        <p className={styles.empty}>{t('admin.drivers.empty') || 'No hay conductores registrados'}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Foto</span>
              <span>{t('admin.drivers.name') || 'Nombre'}</span>
              <span>Email</span>
              <span>Teléfono</span>
              <span>WhatsApp</span>
              <span>Licencia</span>
              <span>Contacto Emergencia</span>
              <span>Vehículo</span>
              <span>Estado</span>
              <span>Viajes</span>
              <span className={styles.actionsHeader}>{t('admin.actions') || 'Acciones'}</span>
            </div>
            {drivers.map(driver => {
              const badge = getLicenseBadge(driver.licenseExpiry);
              return (
                <div key={driver.id} className={styles.tableRow}>
                  {/* Photo */}
                  <span className={styles.cellPhoto}>
                    {driver.photo ? (
                      <img src={driver.photo} alt="" className={styles.photoImg} />
                    ) : (
                      <span className={styles.photoPlaceholder}>
                        {driver.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  {/* Name */}
                  <span className={styles.cellName}>{driver.name}</span>
                  {/* Email */}
                  <span className={styles.cellEmail}>{driver.email}</span>
                  {/* Phone + call button */}
                  <span className={styles.cellContact}>
                    <span className={styles.contactText}>{driver.phone}</span>
                    <a
                      href={`tel:${driver.phone.replace(/[\s+]/g, '')}`}
                      className={styles.contactAction}
                      title="Llamar"
                    >
                      📞
                    </a>
                  </span>
                  {/* WhatsApp + WA button */}
                  <span className={styles.cellContact}>
                    <span className={styles.contactText}>
                      {driver.whatsapp || '—'}
                    </span>
                    {driver.whatsapp && (
                      <a
                        href={`https://wa.me/${driver.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactAction}
                        title="Abrir WhatsApp"
                      >
                        💬
                      </a>
                    )}
                  </span>
                  {/* License + expiry badge */}
                  <span className={styles.cellLicense}>
                    <span>{driver.license || '—'}</span>
                    <span className={styles.licenseDate}>
                      {formatDate(driver.licenseExpiry)}
                    </span>
                    {badge && (
                      <span className={`${styles.licenseBadge} ${styles[`licenseBadge--${badge.type}`]}`}>
                        {badge.label}
                      </span>
                    )}
                  </span>
                  {/* Emergency contact */}
                  <span className={styles.cellEmergency}>
                    {driver.emergencyContact || '—'}
                  </span>
                  {/* Vehicle */}
                  <span>{driver.vehicle}</span>
                  {/* Status */}
                  <span>
                    <span className={`${styles.status} ${styles[`status--${driver.status}`]}`}>
                      {STATUS_LABELS[driver.status] || driver.status}
                    </span>
                  </span>
                  {/* Trips */}
                  <span className={styles.cellTrips}>{driver.trips}</span>
                  {/* Actions */}
                  <span className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      title="Editar"
                      onClick={() => openEdit(driver)}
                    >
                      ✏️
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? 'Editar Conductor' : 'Nuevo Conductor'}
              </h2>
              <button className={styles.modalClose} onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.modalGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Nombre *</label>
                  <input
                    name="name"
                    className={styles.fieldInput}
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Email *</label>
                  <input
                    name="email"
                    type="email"
                    className={styles.fieldInput}
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Teléfono</label>
                  <input
                    name="phone"
                    className={styles.fieldInput}
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>WhatsApp</label>
                  <input
                    name="whatsapp"
                    className={styles.fieldInput}
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="+51999000000"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Licencia</label>
                  <input
                    name="license"
                    className={styles.fieldInput}
                    value={form.license}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Vencimiento Licencia</label>
                  <input
                    name="licenseExpiry"
                    type="date"
                    className={styles.fieldInput}
                    value={form.licenseExpiry}
                    onChange={handleChange}
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.fieldLabel}>Contacto de Emergencia</label>
                  <input
                    name="emergencyContact"
                    className={styles.fieldInput}
                    value={form.emergencyContact}
                    onChange={handleChange}
                    placeholder="Nombre — +51 999 000 000"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Vehículo Asignado</label>
                  <select
                    name="vehicle"
                    className={styles.fieldInput}
                    value={form.vehicle}
                    onChange={handleChange}
                  >
                    {VEHICLES.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Estado</label>
                  <select
                    name="status"
                    className={styles.fieldInput}
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Viajes Realizados</label>
                  <input
                    name="trips"
                    type="number"
                    min="0"
                    className={styles.fieldInput}
                    value={form.trips}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.modalCancel} onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.modalSave}>
                  {editingId ? 'Guardar Cambios' : 'Agregar Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
