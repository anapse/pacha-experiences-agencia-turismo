import { useState, useEffect } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { api } from '../../services/api';
import styles from './Experiences.module.css';

const CATEGORY_LABELS = {
  tubular: 'Tubular',
  aventura: 'Aventura',
  cultural: 'Cultural',
  naturaleza: 'Naturaleza',
  gastronomico: 'Gastronómico',
  relax: 'Relax & Spa',
  familiar: 'Familiar',
  nocturno: 'Nocturno',
};

const MOCK_EXPERIENCES = [
  { id: 1, name: 'Tubulares por el Río Cañete', slug: 'tubulares-rio-canete', category: 'tubular', base_price: 89, duration: '3 horas', is_active: 1, short_description: 'Aventura extrema en los rápidos del río Cañete', description: 'Disfruta de una experiencia única navegando por los rápidos del río Cañete...', min_capacity: 2, max_capacity: 10, includes: ['Guía profesional', 'Chaleco salvavidas', 'Fotografías'], requirements: ['Saber nadar', 'Mayor de 12 años'], restrictions: ['No apto para mujeres embarazadas', 'No apto para problemas cardiacos'], itinerary: [{ time: '08:00', description: 'Salida desde Lunahuaná' }, { time: '09:00', description: 'Inicio de la aventura' }], sort_order: 1 },
  { id: 2, name: 'Canotaje Clásico', slug: 'canotaje-clasico', category: 'tubular', base_price: 69, duration: '2 horas', is_active: 1, short_description: 'Descenso clásico en balsas neumáticas', description: 'El descenso clásico en balsas neumáticas por el río Cañete...', min_capacity: 4, max_capacity: 16, includes: ['Guía profesional', 'Chaleco salvavidas'], requirements: ['Saber nadar'], restrictions: ['No apto para niños menores de 8 años'], itinerary: [{ time: '09:00', description: 'Salida desde el campamento' }], sort_order: 2 },
  { id: 3, name: 'Rafting Familiar', slug: 'rafting-familiar', category: 'aventura', base_price: 55, duration: '1.5 horas', is_active: 1, short_description: 'Aventura suave para toda la familia', description: 'Una experiencia de rafting pensada para toda la familia...', min_capacity: 2, max_capacity: 8, includes: ['Guía', 'Chaleco', 'Casco'], requirements: ['Niños desde 6 años acompañados'], restrictions: [], itinerary: [{ time: '10:00', description: 'Inicio' }], sort_order: 3 },
  { id: 4, name: 'Paseo en Bote', slug: 'paseo-en-bote', category: 'naturaleza', base_price: 35, duration: '1 hora', is_active: 0, short_description: 'Paseo tranquilo observando aves y naturaleza', description: 'Navega tranquilamente por el río mientras observas la flora y fauna local...', min_capacity: 1, max_capacity: 6, includes: ['Capitán', 'Chaleco salvavidas'], requirements: [], restrictions: ['No apto para personas con vértigo'], itinerary: [{ time: '07:00', description: 'Salida' }, { time: '08:00', description: 'Retorno' }], sort_order: 4 },
];

const INITIAL_FORM = {
  name: '',
  description: '',
  short_description: '',
  image_placeholder: '',
  duration: '',
  base_price: '',
  min_capacity: 1,
  max_capacity: 20,
  category: 'tubular',
  includes: '',
  requirements: '',
  restrictions: '',
  itinerary: [{ time: '', description: '' }],
  image_placeholder: '',
  sort_order: 0,
  name_en: '',
  short_description_en: '',
  description_en: '',
  includes_en: '',
  requirements_en: '',
  restrictions_en: '',
  itinerary_en: [{ time: '', description: '' }],
};

export default function Experiences() {
  const { t } = useTranslate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    loadExperiences();
  }, []);

  function loadExperiences() {
    setLoading(true);
    api.get('/experiences')
      .then(res => setExperiences(res.data.data))
      .catch(() => setExperiences(MOCK_EXPERIENCES))
      .finally(() => setLoading(false));
  }

  function openCreateModal() {
    setEditing(null);
    setForm(INITIAL_FORM);
    setActiveTab('basic');
    setModalOpen(true);
  }

  function openEditModal(exp) {
    setEditing(exp);
    setActiveTab('basic');
    setForm({
      name: exp.name || '',
      description: exp.description || '',
      short_description: exp.short_description || '',
      image_placeholder: exp.image_placeholder || '',
      duration: exp.duration || '',
      base_price: exp.base_price ?? '',
      min_capacity: exp.min_capacity ?? 1,
      max_capacity: exp.max_capacity ?? 20,
      category: exp.category || 'tubular',
      includes: Array.isArray(exp.includes) ? exp.includes.join('\n') : '',
      requirements: Array.isArray(exp.requirements) ? exp.requirements.join('\n') : '',
      restrictions: Array.isArray(exp.restrictions) ? exp.restrictions.join('\n') : '',
      itinerary: Array.isArray(exp.itinerary) && exp.itinerary.length > 0
        ? exp.itinerary
        : [{ time: '', description: '' }],
      image_placeholder: exp.image_placeholder || '',
      sort_order: exp.sort_order ?? 0,
      name_en: exp.name_en || '',
      short_description_en: exp.short_description_en || '',
      description_en: exp.description_en || '',
      includes_en: Array.isArray(exp.includes_en) ? exp.includes_en.join('\n') : '',
      requirements_en: Array.isArray(exp.requirements_en) ? exp.requirements_en.join('\n') : '',
      restrictions_en: Array.isArray(exp.restrictions_en) ? exp.restrictions_en.join('\n') : '',
      itinerary_en: Array.isArray(exp.itinerary_en) && exp.itinerary_en.length > 0
        ? exp.itinerary_en
        : [{ time: '', description: '' }],
    });
    setModalOpen(true);
  }

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateItineraryItem(index, field, value) {
    setForm(prev => {
      const itinerary = [...prev.itinerary];
      itinerary[index] = { ...itinerary[index], [field]: value };
      return { ...prev, itinerary };
    });
  }

  function addItineraryItem() {
    setForm(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { time: '', description: '' }],
    }));
  }

  function removeItineraryItem(index) {
    setForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index),
    }));
  }

  function updateItineraryEnItem(index, field, value) {
    setForm(prev => {
      const itinerary_en = [...prev.itinerary_en];
      itinerary_en[index] = { ...itinerary_en[index], [field]: value };
      return { ...prev, itinerary_en };
    });
  }

  function addItineraryEnItem() {
    setForm(prev => ({
      ...prev,
      itinerary_en: [...prev.itinerary_en, { time: '', description: '' }],
    }));
  }

  function removeItineraryEnItem(index) {
    setForm(prev => ({
      ...prev,
      itinerary_en: prev.itinerary_en.filter((_, i) => i !== index),
    }));
  }

  function textareaToArray(text) {
    return text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description,
      short_description: form.short_description,
      image_placeholder: form.image_placeholder || null,
      duration: form.duration,
      base_price: parseFloat(form.base_price) || 0,
      min_capacity: parseInt(form.min_capacity) || 1,
      max_capacity: parseInt(form.max_capacity) || 20,
      category: form.category,
      includes: textareaToArray(form.includes),
      requirements: textareaToArray(form.requirements),
      restrictions: textareaToArray(form.restrictions),
      itinerary: form.itinerary.filter(i => i.time || i.description),
      image_placeholder: form.image_placeholder || null,
      sort_order: parseInt(form.sort_order) || 0,
      name_en: form.name_en || null,
      short_description_en: form.short_description_en || null,
      description_en: form.description_en || null,
      includes_en: textareaToArray(form.includes_en),
      requirements_en: textareaToArray(form.requirements_en),
      restrictions_en: textareaToArray(form.restrictions_en),
      itinerary_en: form.itinerary_en.filter(i => i.time || i.description),
    };

    try {
      if (editing) {
        await api.put(`/experiences/${editing.id}`, payload);
      } else {
        await api.post('/experiences', payload);
      }
      setModalOpen(false);
      loadExperiences();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la experiencia');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/experiences/${id}`);
      setDeleteConfirm(null);
      loadExperiences();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la experiencia');
    }
  }

  if (loading) {
    return <div className={styles.loading}>{t('admin.loading') || 'Cargando...'}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('admin.experiences.title') || 'Experiencias'}</h1>
          <p className={styles.subtitle}>{t('admin.experiences.subtitle') || 'Gestiona las experiencias y actividades turísticas'}</p>
        </div>
        <button className={styles.addButton} onClick={openCreateModal}>
          + {t('admin.experiences.add') || 'Nueva Experiencia'}
        </button>
      </header>

      {experiences.length === 0 ? (
        <p className={styles.empty}>{t('admin.experiences.empty') || 'No hay experiencias registradas'}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>{t('admin.experiences.name') || 'Nombre'}</span>
              <span>{t('admin.experiences.slug') || 'Slug'}</span>
              <span>{t('admin.experiences.category') || 'Categoría'}</span>
              <span>{t('admin.experiences.price') || 'Precio'}</span>
              <span>{t('admin.experiences.duration') || 'Duración'}</span>
              <span>{t('admin.experiences.status') || 'Estado'}</span>
              <span className={styles.actionsHeader}>{t('admin.actions') || 'Acciones'}</span>
            </div>
            {experiences.map(exp => (
              <div key={exp.id} className={styles.tableRow}>
                <span className={styles.cellName}>{exp.name}</span>
                <span className={styles.cellSlug}>{exp.slug}</span>
                <span>
                  <span className={styles.category}>
                    {CATEGORY_LABELS[exp.category] || exp.category}
                  </span>
                </span>
                <span className={styles.cellPrice}>S/ {Number(exp.base_price).toFixed(2)}</span>
                <span className={styles.cellDuration}>{exp.duration}</span>
                <span>
                  <span className={`${styles.status} ${styles[exp.is_active ? 'status--active' : 'status--inactive']}`}>
                    {exp.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </span>
                <span className={styles.actions}>
                  <button className={styles.actionBtn} title="Editar" onClick={() => openEditModal(exp)}>✏️</button>
                  <button className={styles.actionBtn} title="Eliminar" onClick={() => setDeleteConfirm(exp)}>🗑️</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Editar Experiencia' : 'Nueva Experiencia'}</h2>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className={styles.tabs}>
              {['basic', 'details', 'includes', 'itinerary', 'english'].map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'basic' && 'Info Básica'}
                  {tab === 'details' && 'Detalles'}
                  {tab === 'includes' && 'Incluye/Requiere'}
                  {tab === 'itinerary' && 'Itinerario'}
                  {tab === 'english' && 'Inglés'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              {activeTab === 'basic' && (
                <div className={styles.tabContent}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nombre *</label>
                    <input
                      className={styles.input}
                      value={form.name}
                      onChange={e => updateForm('name', e.target.value)}
                      placeholder="Ej: Tubulares por el Río Cañete"
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Imagen (placeholder)</label>
                    <input
                      className={styles.input}
                      value={form.image_placeholder}
                      onChange={e => updateForm('image_placeholder', e.target.value)}
                      placeholder="Ej: IMG_HERO_ATARDECER_HUACACHINA"
                    />
                    <span style={{fontSize:'0.75rem',color:'var(--color-text-tertiary)'}}>Nombre del placeholder de la imagen</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Descripción Corta</label>
                    <input
                      className={styles.input}
                      value={form.short_description}
                      onChange={e => updateForm('short_description', e.target.value)}
                      placeholder="Breve resumen de la experiencia"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Descripción</label>
                    <textarea
                      className={styles.textarea}
                      value={form.description}
                      onChange={e => updateForm('description', e.target.value)}
                      placeholder="Descripción detallada de la experiencia"
                      rows={4}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Categoría</label>
                    <select
                      className={styles.select}
                      value={form.category}
                      onChange={e => updateForm('category', e.target.value)}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>URL Imagen Placeholder</label>
                    <input
                      className={styles.input}
                      value={form.image_placeholder}
                      onChange={e => updateForm('image_placeholder', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Orden</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={form.sort_order}
                      onChange={e => updateForm('sort_order', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className={styles.tabContent}>
                  <div className={styles.field}>
                    <label className={styles.label}>Duración</label>
                    <input
                      className={styles.input}
                      value={form.duration}
                      onChange={e => updateForm('duration', e.target.value)}
                      placeholder="Ej: 3 horas, Medio día, Full day"
                    />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Precio Base (S/) *</label>
                      <input
                        className={styles.input}
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.base_price}
                        onChange={e => updateForm('base_price', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Capacidad Mínima</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="1"
                        value={form.min_capacity}
                        onChange={e => updateForm('min_capacity', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Capacidad Máxima</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="1"
                        value={form.max_capacity}
                        onChange={e => updateForm('max_capacity', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'includes' && (
                <div className={styles.tabContent}>
                  <div className={styles.field}>
                    <label className={styles.label}>Incluye</label>
                    <textarea
                      className={styles.textarea}
                      value={form.includes}
                      onChange={e => updateForm('includes', e.target.value)}
                      placeholder="Un item por línea&#10;Ej: Guía profesional&#10;Chaleco salvavidas&#10;Fotografías"
                      rows={5}
                    />
                    <span className={styles.hint}>Un item por línea</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Requisitos</label>
                    <textarea
                      className={styles.textarea}
                      value={form.requirements}
                      onChange={e => updateForm('requirements', e.target.value)}
                      placeholder="Un requisito por línea&#10;Ej: Saber nadar&#10;Mayor de 12 años"
                      rows={4}
                    />
                    <span className={styles.hint}>Un item por línea</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Restricciones</label>
                    <textarea
                      className={styles.textarea}
                      value={form.restrictions}
                      onChange={e => updateForm('restrictions', e.target.value)}
                      placeholder="Una restricción por línea&#10;Ej: No apto para embarazadas&#10;No apto para problemas cardiacos"
                      rows={4}
                    />
                    <span className={styles.hint}>Un item por línea</span>
                  </div>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className={styles.tabContent}>
                  <p className={styles.hint} style={{ marginBottom: 12 }}>Agrega los horarios y descripciones del itinerario</p>
                  {form.itinerary.map((item, idx) => (
                    <div key={idx} className={styles.itineraryRow}>
                      <div className={styles.itineraryFields}>
                        <div className={styles.field}>
                          <label className={styles.label}>Hora</label>
                          <input
                            className={styles.input}
                            value={item.time}
                            onChange={e => updateItineraryItem(idx, 'time', e.target.value)}
                            placeholder="08:00"
                          />
                        </div>
                        <div className={styles.field} style={{ flex: 1 }}>
                          <label className={styles.label}>Descripción</label>
                          <input
                            className={styles.input}
                            value={item.description}
                            onChange={e => updateItineraryItem(idx, 'description', e.target.value)}
                            placeholder="Ej: Salida desde Lunahuaná"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.removeItemBtn}
                        onClick={() => removeItineraryItem(idx)}
                        disabled={form.itinerary.length <= 1}
                        title="Eliminar item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button type="button" className={styles.addItemBtn} onClick={addItineraryItem}>
                    + Agregar horario
                  </button>
                </div>
              )}

              {activeTab === 'english' && (
                <div className={styles.tabContent}>
                  <h3 style={{ marginBottom: 16, color: '#0ea5e9' }}>🌐 English Translation</h3>

                  <div className={styles.field}>
                    <label className={styles.label}>Name (English)</label>
                    <input
                      className={styles.input}
                      value={form.name_en}
                      onChange={e => updateForm('name_en', e.target.value)}
                      placeholder="Ej: Tubular Ride in Huacachina"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Short Description (English)</label>
                    <input
                      className={styles.input}
                      value={form.short_description_en}
                      onChange={e => updateForm('short_description_en', e.target.value)}
                      placeholder="Brief description in English"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Description (English)</label>
                    <textarea
                      className={styles.textarea}
                      value={form.description_en}
                      onChange={e => updateForm('description_en', e.target.value)}
                      placeholder="Full description in English"
                      rows={4}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Includes (English)</label>
                    <textarea
                      className={styles.textarea}
                      value={form.includes_en}
                      onChange={e => updateForm('includes_en', e.target.value)}
                      placeholder="One item per line&#10;Ej: Professional guide&#10;Bottled water"
                      rows={5}
                    />
                    <span className={styles.hint}>One item per line</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Requirements (English)</label>
                    <textarea
                      className={styles.textarea}
                      value={form.requirements_en}
                      onChange={e => updateForm('requirements_en', e.target.value)}
                      placeholder="One requirement per line&#10;Ej: Comfortable clothing&#10;Closed-toe shoes"
                      rows={4}
                    />
                    <span className={styles.hint}>One item per line</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Restrictions (English)</label>
                    <textarea
                      className={styles.textarea}
                      value={form.restrictions_en}
                      onChange={e => updateForm('restrictions_en', e.target.value)}
                      placeholder="One restriction per line&#10;Ej: Not recommended for pregnant women"
                      rows={4}
                    />
                    <span className={styles.hint}>One item per line</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Itinerary (English)</label>
                    <p className={styles.hint} style={{ marginBottom: 12 }}>Add schedule times and descriptions in English</p>
                    {form.itinerary_en.map((item, idx) => (
                      <div key={idx} className={styles.itineraryRow}>
                        <div className={styles.itineraryFields}>
                          <div className={styles.field}>
                            <label className={styles.label}>Time</label>
                            <input
                              className={styles.input}
                              value={item.time}
                              onChange={e => updateItineraryEnItem(idx, 'time', e.target.value)}
                              placeholder="08:00"
                            />
                          </div>
                          <div className={styles.field} style={{ flex: 1 }}>
                            <label className={styles.label}>Description</label>
                            <input
                              className={styles.input}
                              value={item.description}
                              onChange={e => updateItineraryEnItem(idx, 'description', e.target.value)}
                              placeholder="Ej: Departure from Plaza de Armas"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeItemBtn}
                          onClick={() => removeItineraryEnItem(idx)}
                          disabled={form.itinerary_en.length <= 1}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button type="button" className={styles.addItemBtn} onClick={addItineraryEnItem}>
                      + Add schedule time
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Experiencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {deleteConfirm && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>¿Eliminar experiencia?</h3>
            <p className={styles.confirmText}>
              Se desactivará <strong>{deleteConfirm.name}</strong>. Podrás reactivarla después.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(deleteConfirm.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
