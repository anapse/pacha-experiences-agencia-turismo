import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import Image from '../components/common/Image';
import { useTranslate } from '../hooks/useTranslate';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPrice } from '../utils/currency';
import styles from './Detail.module.css';

/* ─── Mock data para desarrollo ─── */
const MOCK_EXPERIENCE = {
  id: 1,
  slug: 'tubulares-huacachina',
  name: 'Tubulares en Huacachina',
  short_description: 'Deslízate sobre las dunas más altas de Sudamérica mientras el sol se pone. Una experiencia llena de adrenalina y paisajes únicos.',
  long_description: 'Vive la emoción de recorrer las dunas más altas de Sudamérica a bordo de nuestros tubulares. Durante 30 minutos de pura adrenalina, sentirás la velocidad y la libertad del desierto mientras nuestro guía experto te lleva por las rutas más emocionantes. Al atardecer, el paisaje se tiñe de dorado y naranja, creando un espectáculo natural inolvidable.',
  duration: '30 min',
  difficulty: 'Moderada',
  base_price: 50,
  category: 'tubular',
  image_placeholder: 'IMG_TUBULAR_DUNAS',
  gallery: ['IMG_TUBULAR_DUNAS', 'IMG_BUGGY_ATARDECER', 'IMG_CAROUSEL_BUGGY', 'IMG_CANAM'],
  includes: [
    'Recogida desde Plaza de Armas',
    'Traslado a Tierra Prometida',
    '30 minutos de tubulares extremos',
    'Guía profesional bilingüe',
    'Agua embotellada',
    'Seguro de accidentes',
    'Regreso seguro al punto de encuentro',
  ],
  not_includes: [
    'Sandboard (opcional desde S/ 25)',
    'Fotografía profesional',
    'Bebidas adicionales',
    'Propinas',
  ],
  itinerary: [
    { time: '15:30', title: 'Recogida', description: 'Punto de encuentro en Plaza de Armas, Ica' },
    { time: '15:45', title: 'Traslado', description: 'Viaje hacia Tierra Prometida (20 min)' },
    { time: '16:10', title: 'Preparación', description: 'Charla de seguridad y colocación de equipos' },
    { time: '16:30', title: '¡A rodar!', description: '30 minutos de tubulares extremos por las dunas' },
    { time: '17:00', title: 'Fotos y atardecer', description: 'Tiempo libre para fotos durante el atardecer' },
    { time: '17:30', title: 'Regreso', description: 'Retorno a Plaza de Armas' },
  ],
  requirements: [
    'Edad mínima: 8 años',
    'Peso máximo: 120 kg',
    'No se requiere experiencia previa',
    'Firmar consentimiento informado',
  ],
  restrictions: [
    'No apto para mujeres embarazadas',
    'No apto para personas con problemas de espalda o cuello',
    'No apto bajo efectos de alcohol o drogas',
    'Menores deben ir acompañados de un adulto',
  ],
  schedules: [
    { time: '08:00 - 09:30', label: 'Matutino', available: true },
    { time: '10:00 - 11:30', label: 'Media mañana', available: true },
    { time: '14:00 - 15:30', label: 'Tarde', available: false },
    { time: '15:30 - 17:00', label: 'Atardecer ★', available: true },
  ],
};

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'María García',
    avatar: null,
    rating: 5,
    text: '¡Increíble experiencia! Los guías son muy profesionales y la vista del atardecer desde las dunas es algo que todos deberían vivir al menos una vez.',
    date: '2025-12-15',
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    avatar: null,
    rating: 4,
    text: 'Muy divertido. Los tubulares son una explosión de adrenalina. El único pero es que el tiempo pasa volando, ojalá dure más.',
    date: '2025-11-28',
  },
  {
    id: 3,
    name: 'Ana Torres',
    avatar: null,
    rating: 5,
    text: 'Reservé el pack romance y fue mágico. La cena en las dunas al atardecer con vista al oasis es el plan perfecto para parejas.',
    date: '2025-10-10',
  },
];

const MOCK_RELATED = [
  { id: 2, slug: 'tubulares-sandboard-basico', name: 'Tubulares + Sandboard', price: 75, image: 'IMG_SANDBOARD' },
  { id: 3, slug: 'pack-romance-atardecer', name: 'Pack Romance', price: 200, image: 'IMG_PAREJA_ATARDECER' },
  { id: 4, slug: 'tubulares-extremos', name: 'Tubulares Extremos', price: 65, image: 'IMG_CANAM' },
];

function StarRating({ rating }) {
  return (
    <div className={styles.stars} aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
  const colorIndex = name.length % colors.length;

  return (
    <div className={styles.avatar} style={{ background: colors[colorIndex] }}>
      {initials}
    </div>
  );
}

export default function Detail() {
  const { slug } = useParams();
  const { t, lang } = useTranslate();
  const { currency } = useCurrency();

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchExperience() {
      try {
        const res = await api.get(`/experiences/${slug}`, { params: { lang } });
        setExperience(res.data.data);
      } catch {
        // Fallback a mock data
        const mock = { ...MOCK_EXPERIENCE, slug };
        if (slug === 'tubulares-sandboard-basico') {
          mock.name = 'Tubulares + Sandboard';
          mock.short_description = 'Combina adrenalina con sandboard. Doble diversión garantizada.';
          mock.base_price = 75;
          mock.image_placeholder = 'IMG_SANDBOARD';
          mock.gallery = ['IMG_SANDBOARD', 'IMG_TUBULAR_DUNAS', 'IMG_CAROUSEL_BUGGY', 'IMG_CANAM'];
        } else if (slug === 'pack-romance-atardecer') {
          mock.name = 'Pack Romance';
          mock.short_description = 'Tubulares privados y cena romántica en las dunas al atardecer.';
          mock.base_price = 200;
          mock.image_placeholder = 'IMG_PAREJA_ATARDECER';
          mock.gallery = ['IMG_PAREJA_ATARDECER', 'IMG_TUBULAR_DUNAS', 'IMG_SELFIE_PAREJA', 'IMG_CAROUSEL_BUGGY'];
        } else if (slug === 'tubulares-extremos') {
          mock.name = 'Tubulares Extremos';
          mock.short_description = 'La máxima adrenalina en las dunas más altas.';
          mock.base_price = 65;
          mock.image_placeholder = 'IMG_CANAM';
          mock.gallery = ['IMG_CANAM', 'IMG_BUGGY_ATARDECER', 'IMG_CAROUSEL_FELIZ', 'IMG_CLIENTE_DIVERTIDO'];
        } else if (slug === 'tubulares-sandboard-premium') {
          mock.name = 'Tubulares + Sandboard Premium';
          mock.short_description = 'La experiencia completa con fotografía profesional y equipos de primera.';
          mock.base_price = 100;
          mock.image_placeholder = 'IMG_CAROUSEL_BUGGY';
          mock.gallery = ['IMG_CAROUSEL_BUGGY', 'IMG_BUGGY_ADVENTURE', 'IMG_CANAM', 'IMG_CLIENTES_FELICES'];
        } else if (slug === 'tour-buggies-privado') {
          mock.name = 'Tour en Buggies Privado';
          mock.short_description = 'Recorre las dunas en un buggy privado con chofer incluido.';
          mock.base_price = 150;
          mock.image_placeholder = 'IMG_CAROUSEL_BUGGY';
          mock.gallery = ['IMG_CAROUSEL_BUGGY', 'IMG_BUGGY_ATARDECER', 'IMG_HERO_BUGGY_OASIS', 'IMG_CANAM'];
        } else if (slug === 'sandboard-clases') {
          mock.name = 'Clases de Sandboard';
          mock.short_description = 'Aprende sandboard con instructores expertos.';
          mock.base_price = 45;
          mock.image_placeholder = 'IMG_CLIENTE_DIVERTIDO';
          mock.gallery = ['IMG_CLIENTE_DIVERTIDO', 'IMG_CAROUSEL_SOLO', 'IMG_CAROUSEL_FELIZ', 'IMG_CAROUSEL_BUGGY'];
        }
        setExperience(mock);
      } finally {
        setLoading(false);
      }
    }
    fetchExperience();
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeletonMain} />
          <div className={styles.skeletonContent}>
            <div className={styles.skelLine} style={{ width: '60%', height: 32 }} />
            <div className={styles.skelLine} style={{ width: '90%' }} />
            <div className={styles.skelLine} style={{ width: '40%' }} />
            <div className={styles.skelLine} style={{ width: '75%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>😕</span>
            <h2>{t('general.error')}</h2>
            <Link to="/experiencias" className={styles.backLink}>
              ← {t('general.volver')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mainImg = experience.image_placeholder
    ? `[${experience.image_placeholder}]`
    : '[IMG_TUBULAR_DUNAS]';

  const galleryImages = experience.gallery?.length
    ? experience.gallery.map(img => `[${img}]`)
    : [mainImg];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Breadcrumb ── */}
        <nav className={styles.breadcrumb}>
          <Link to="/">{t('nav.inicio')}</Link>
          <span className={styles.breadSeparator}>/</span>
          <Link to="/experiencias">{t('nav.experiencias')}</Link>
          <span className={styles.breadSeparator}>/</span>
          <span>{experience.name}</span>
        </nav>

        {/* ── 1. Galería ── */}
        <section className={styles.gallerySection}>
          <div className={styles.mainImage}>
            <Image
              src={galleryImages[activeImage]}
              alt={experience.name}
              width={800}
              height={500}
              priority
            />
            <div className={styles.galleryCount}>
              {activeImage + 1} / {galleryImages.length}
            </div>
          </div>
          {galleryImages.length > 1 && (
            <div className={styles.galleryThumbs}>
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt={`${experience.name} - vista ${i + 1}`} width={100} height={70} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Layout 2 columnas ── */}
        <div className={styles.twoCol}>
          {/* ── Columna principal ── */}
          <div className={styles.mainCol}>
            {/* ── 2. Título + Meta ── */}
            <header className={styles.hero}>
              {experience.category && (
                <span className={styles.categoryBadge}>{experience.category}</span>
              )}
              <h1 className={styles.title}>{experience.name}</h1>
              <p className={styles.shortDesc}>{experience.short_description}</p>
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <span className={styles.metaIcon}>⏱</span>
                  {t('detail.duracion')}: <strong>{experience.duration}</strong>
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaIcon}>📊</span>
                  {t('experiences.dificultad')}: <strong>{experience.difficulty}</strong>
                </span>
              </div>
            </header>

            {/* ── 3. Incluye / No incluye ── */}
            <section className={styles.section}>
              <div className={styles.incluyeGrid}>
                <div className={styles.incluyeCard}>
                  <h3 className={styles.sectionTitle}>
                    <span className={styles.checkIcon}>✓</span>
                    {t('detail.incluye')}
                  </h3>
                  <ul className={styles.list}>
                    {experience.includes?.map((item, i) => (
                      <li key={i} className={styles.listItemIncluye}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.incluyeCard}>
                  <h3 className={styles.sectionTitle}>
                    <span className={styles.crossIcon}>✗</span>
                    {t('detail.no_incluye')}
                  </h3>
                  <ul className={styles.list}>
                    {experience.not_includes?.map((item, i) => (
                      <li key={i} className={styles.listItemNoIncluye}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ── 4. Itinerario ── */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('detail.itinerario')}</h2>
              <div className={styles.timeline}>
                {experience.itinerary?.map((step, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    {i < (experience.itinerary?.length || 0) - 1 && (
                      <div className={styles.timelineLine} />
                    )}
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineTime}>{step.time}</span>
                      <h4 className={styles.timelineTitle}>{step.title}</h4>
                      {step.description && (
                        <p className={styles.timelineDesc}>{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── 5. Requisitos y Restricciones ── */}
            <section className={styles.section}>
              <div className={styles.reqGrid}>
                <div className={styles.reqCard}>
                  <h3 className={styles.sectionTitle}>
                    <span className={styles.reqIcon}>📋</span>
                    {t('detail.requisitos')}
                  </h3>
                  <ul className={styles.list}>
                    {experience.requirements?.map((item, i) => (
                      <li key={i} className={styles.listItemReq}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.reqCard}>
                  <h3 className={styles.sectionTitle}>
                    <span className={styles.reqIcon}>⚠️</span>
                    {t('detail.restricciones')}
                  </h3>
                  <ul className={styles.list}>
                    {experience.restrictions?.map((item, i) => (
                      <li key={i} className={styles.listItemRest}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ── 8. Reseñas ── */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('detail.resenas')}</h2>
              <div className={styles.reviewsList}>
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <Avatar name={review.name} />
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewName}>{review.name}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                    <p className={styles.reviewText}>{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              {/* Precio */}
              <div className={styles.priceCard}>
                <div className={styles.priceLabel}>{t('general.desde')}</div>
                <div className={styles.priceValue}>
                  {formatPrice(experience.base_price, currency)}
                </div>
                <div className={styles.pricePer}>/ persona</div>
              </div>

              {/* 7. Botones */}
              <div className={styles.buttonGroup}>
                <Link
                  to={`/calendario?experiencia=${experience.slug}`}
                  className={styles.btnPrimary}
                >
                  {t('detail.reservar')}
                </Link>
                <a
                  href={`https://wa.me/51999000000?text=Hola,%20quiero%20información%20sobre%20${encodeURIComponent(experience.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnWhatsapp}
                >
                  <span className={styles.whatsappIcon}>📱</span>
                  {t('detail.whatsapp')}
                </a>
              </div>

              {/* 6. Horarios disponibles */}
              <div className={styles.schedulesCard}>
                <h3 className={styles.schedulesTitle}>{t('detail.horarios')}</h3>
                <div className={styles.schedulesList}>
                  {experience.schedules?.map((s, i) => (
                    <div
                      key={i}
                      className={`${styles.scheduleItem} ${!s.available ? styles.scheduleUnavailable : ''}`}
                    >
                      <div className={styles.scheduleInfo}>
                        <span className={styles.scheduleLabel}>{s.label}</span>
                        <span className={styles.scheduleTime}>{s.time}</span>
                      </div>
                      <span className={`${styles.scheduleBadge} ${s.available ? styles.badgeAvailable : styles.badgeFull}`}>
                        {s.available ? t('calendar.disponible') : t('calendar.agotado')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── 9. Experiencias relacionadas ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('detail.relacionadas')}</h2>
          <div className={styles.relatedGrid}>
            {MOCK_RELATED.map(exp => (
              <Link
                key={exp.id}
                to={`/experiencias/${exp.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedImage}>
                  <Image src={`[${exp.image}]`} alt={exp.name} width={300} height={200} />
                </div>
                <div className={styles.relatedBody}>
                  <h3 className={styles.relatedName}>{exp.name}</h3>
                  <span className={styles.relatedPrice}>
                    {formatPrice(exp.price, currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
