import { useState, useEffect } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { api } from '../../services/api';
import styles from './Carousel.module.css';

const MOCK_SLIDES = [
  { id: 1, image_placeholder: '[IMG_HERO_ATARDECER_HUACACHINA]', title_es: 'Vive la aventura en las dunas', title_en: 'Live the adventure on the dunes', desc_es: 'Tubulares, sandboard y experiencias únicas en el desierto peruano.', desc_en: 'Tubular rides, sandboard, and unique experiences in the Peruvian desert.', cta_es: 'Explorar Experiencias', cta_en: 'Explore Experiences', link: '/experiencias', sort_order: 0, is_active: 1 },
  { id: 2, image_placeholder: '[IMG_HERO_BUGGIES]', title_es: 'Tubulares extremos', title_en: 'Extreme tubular rides', desc_es: '30 minutos de adrenalina pura sobre las dunas más altas de Sudamérica.', desc_en: '30 minutes of pure adrenaline on the highest dunes in South America.', cta_es: 'Reservar Ahora', cta_en: 'Book Now', link: '/experiencias', sort_order: 1, is_active: 1 },
  { id: 3, image_placeholder: '[IMG_HERO_BUGGY_OASIS]', title_es: 'Pack Romance', title_en: 'Romance Pack', desc_es: 'Una experiencia mágica para parejas. Tubulares privados y cena romántica.', desc_en: 'A magical experience for couples. Private tubular ride and romantic dinner.', cta_es: 'Ver Pack', cta_en: 'View Pack', link: '/experiencias', sort_order: 2, is_active: 1 },
  { id: 4, image_placeholder: '[IMG_CAROUSEL_BUGGY]', title_es: 'Aventura en grupo', title_en: 'Group adventure', desc_es: 'Comparte la emoción con amigos y familia.', desc_en: 'Share the excitement with friends and family.', cta_es: 'Ver Tours', cta_en: 'View Tours', link: '/experiencias', sort_order: 3, is_active: 1 },
  { id: 5, image_placeholder: '[IMG_CAROUSEL_SOLO]', title_es: 'Atardeceres únicos', title_en: 'Unique sunsets', desc_es: 'El sol pintando de dorado las dunas más altas de Sudamérica.', desc_en: 'The sun painting the highest dunes of South America in gold.', cta_es: 'Descubrir', cta_en: 'Discover', link: '/experiencias', sort_order: 4, is_active: 1 },
  { id: 6, image_placeholder: '[IMG_BANNER_GRUPO]', title_es: 'Momentos inolvidables', title_en: 'Unforgettable moments', desc_es: 'Cada viaje es una historia que merece ser contada.', desc_en: 'Every trip is a story waiting to be told.', cta_es: 'Vive tu historia', cta_en: 'Live your story', link: '/experiencias', sort_order: 5, is_active: 1 },
  { id: 7, image_placeholder: '[IMG_CAROUSEL_BUGGY_SUNSET]', title_es: 'Aventura garantizada', title_en: 'Adventure guaranteed', desc_es: 'Seguridad y diversión en cada recorrido.', desc_en: 'Safety and fun on every ride.', cta_es: 'Más Info', cta_en: 'More Info', link: '/experiencias', sort_order: 6, is_active: 1 },
  { id: 8, image_placeholder: '[IMG_BANNER_DESERT]', title_es: 'Explora el desierto', title_en: 'Explore the desert', desc_es: 'Huacachina te espera con sus dunas y atardeceres únicos.', desc_en: 'Huacachina awaits you with its dunes and unique sunsets.', cta_es: 'Explorar', cta_en: 'Explore', link: '/experiencias', sort_order: 7, is_active: 1 },
  { id: 9, image_placeholder: '[IMG_HUACACHINA_NOCHE]', title_es: 'Magia bajo las estrellas', title_en: 'Magic under the stars', desc_es: 'El desierto más imponente de Sudamérica bajo un manto de estrellas.', desc_en: "South America's most imposing desert under a blanket of stars.", cta_es: 'Ver más', cta_en: 'View more', link: '/experiencias', sort_order: 8, is_active: 1 },
];

const INITIAL_FORM = {
  image_placeholder: '',
  title_es: '',
  title_en: '',
  desc_es: '',
  desc_en: '',
  cta_es: 'Ver más',
  cta_en: 'View more',
  link: '/experiencias',
  sort_order: 0,
  is_active: 1,
};

export default function Carousel() {
  const { t } = useTranslate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('es');

  useEffect(() => {
    loadSlides();
  }, []);

  function loadSlides() {
    setLoading(true);
    api.get('/carousel')
      .then(res => setSlides(res.data.data))
      .catch(() => setSlides(MOCK_SLIDES))
      .finally(() => setLoading(false));
  }

  function openCreateModal() {
    setEditing(null);
    setForm(INITIAL_FORM);
    setActiveTab('es');
    setModalOpen(true);
  }

  function openEditModal(slide) {
    setEditing(slide);
    setActiveTab('es');
    setForm({
      image_placeholder: slide.image_placeholder || '',
      title_es: slide.title_es || '',
      title_en: slide.title_en || '',
      desc_es: slide.desc_es || '',
      desc_en: slide.desc_en || '',
      cta_es: slide.cta_es || 'Ver más',
      cta_en: slide.cta_en || 'View more',
      link: slide.link || '/experiencias',
      sort_order: slide.sort_order ?? 0,
      is_active: slide.is_active ?? 1,
    });
    setModalOpen(true);
  }

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      image_placeholder: form.image_placeholder,
      title_es: form.title_es,
      title_en: form.title_en || null,
      desc_es: form.desc_es,
      desc_en: form.desc_en || null,
      cta_es: form.cta_es || 'Ver más',
      cta_en: form.cta_en || 'View more',
      link: form.link || '/experiencias',
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active ? 1 : 0,
    };

    try {
      if (editing) {
        await api.put(`/carousel/${editing.id}`, payload);
      } else {
        await api.post('/carousel', payload);
      }
      setModalOpen(false);
      loadSlides();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar el slide');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/carousel/${id}`);
      setDeleteConfirm(null);
      loadSlides();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el slide');
    }
  }

  if (loading) {
    return <div className={styles.loading}>{t('admin.loading') || 'Cargando...'}</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Carrusel</h1>
          <p className={styles.subtitle}>Gestiona los slides del carrusel principal del Home</p>
        </div>
        <button className={styles.addButton} onClick={openCreateModal}>
          + Nuevo Slide
        </button>
      </header>

      {slides.length === 0 ? (
        <p className={styles.empty}>No hay slides registrados</p>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Imagen</span>
              <span>Título (ES)</span>
              <span>Descripción (ES)</span>
              <span>Orden</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {slides.map(slide => (
              <div key={slide.id} className={styles.tableRow}>
                <span className={styles.placeholder}>{slide.image_placeholder}</span>
                <span className={styles.cellName}>{slide.title_es}</span>
                <span className={styles.cellDesc}>{slide.desc_es}</span>
                <span className={styles.orderCell}>{slide.sort_order}</span>
                <span>
                  <span className={`${styles.status} ${styles[slide.is_active ? 'status--active' : 'status--inactive']}`}>
                    {slide.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </span>
                <span className={styles.actions}>
                  <button className={styles.actionBtn} title="Editar" onClick={() => openEditModal(slide)}>✏️</button>
                  <button className={styles.actionBtn} title="Eliminar" onClick={() => setDeleteConfirm(slide)}>🗑️</button>
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
              <h2>{editing ? 'Editar Slide' : 'Nuevo Slide'}</h2>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'es' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('es')}
              >
                🇪🇸 Español
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'en' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('en')}
              >
                🇺🇸 English
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              {activeTab === 'es' && (
                <div className={styles.tabContent}>
                  <div className={styles.field}>
                    <label className={styles.label}>Image Placeholder *</label>
                    <input
                      className={styles.input}
                      value={form.image_placeholder}
                      onChange={e => updateForm('image_placeholder', e.target.value)}
                      placeholder="Ej: IMG_HERO_ATARDECER_HUACACHINA"
                      required
                    />
                    <span style={{fontSize:'0.75rem',color:'var(--color-text-tertiary)'}}>Nombre del placeholder de la imagen</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Título (Español) *</label>
                    <input
                      className={styles.input}
                      value={form.title_es}
                      onChange={e => updateForm('title_es', e.target.value)}
                      placeholder="Ej: Vive la aventura en las dunas"
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Descripción (Español) *</label>
                    <textarea
                      className={styles.textarea}
                      value={form.desc_es}
                      onChange={e => updateForm('desc_es', e.target.value)}
                      placeholder="Descripción del slide en español"
                      rows={3}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>CTA (Español)</label>
                    <input
                      className={styles.input}
                      value={form.cta_es}
                      onChange={e => updateForm('cta_es', e.target.value)}
                      placeholder="Ver más"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Enlace</label>
                    <input
                      className={styles.input}
                      value={form.link}
                      onChange={e => updateForm('link', e.target.value)}
                      placeholder="/experiencias"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Orden</label>
                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      value={form.sort_order}
                      onChange={e => updateForm('sort_order', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      className={`${styles.toggle} ${form.is_active ? styles.toggleActive : ''}`}
                      onClick={() => updateForm('is_active', form.is_active ? 0 : 1)}
                    >
                      <span className={styles.toggleKnob} />
                    </button>
                    <span className={styles.toggleLabel}>
                      {form.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'en' && (
                <div className={styles.tabContent}>
                  <h3 style={{ marginBottom: 16, color: '#0ea5e9' }}>🌐 English Translation</h3>

                  <div className={styles.field}>
                    <label className={styles.label}>Title (English)</label>
                    <input
                      className={styles.input}
                      value={form.title_en}
                      onChange={e => updateForm('title_en', e.target.value)}
                      placeholder="Ej: Live the adventure on the dunes"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Description (English)</label>
                    <textarea
                      className={styles.textarea}
                      value={form.desc_en}
                      onChange={e => updateForm('desc_en', e.target.value)}
                      placeholder="Slide description in English"
                      rows={3}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>CTA (English)</label>
                    <input
                      className={styles.input}
                      value={form.cta_en}
                      onChange={e => updateForm('cta_en', e.target.value)}
                      placeholder="View more"
                    />
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Slide'}
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
            <h3 className={styles.confirmTitle}>¿Eliminar slide?</h3>
            <p className={styles.confirmText}>
              Se desactivará <strong>{deleteConfirm.title_es}</strong>. Podrás reactivarlo después.
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
