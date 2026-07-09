import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../components/common/Image';
import Carousel from '../components/common/Carousel';
import { useTranslate } from '../hooks/useTranslate';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPrice } from '../utils/currency';
import { api } from '../services/api';
import styles from './Home.module.css';

const MOCK_EXPERIENCES = [
  {
    id: 1,
    title: 'Tubulares en Huacachina',
    description: 'Deslízate sobre las dunas más altas de Sudamérica mientras el sol se pone.',
    price: 50,
    image: '[IMG_TUBULAR_DUNAS]',
    slug: 'tubulares-huacachina'
  },
  {
    id: 2,
    title: 'Tubulares + Sandboard',
    description: 'Combina adrenalina con sandboard. Doble diversión garantizada.',
    price: 75,
    image: '[IMG_SANDBOARD]',
    slug: 'tubulares-sandboard-basico'
  },
  {
    id: 3,
    title: 'Pack Romance',
    description: 'Tubulares privados y cena romántica en las dunas al atardecer.',
    price: 200,
    image: '[IMG_PAREJA_ATARDECER]',
    slug: 'pack-romance-atardecer'
  }
];

const MOCK_CAROUSEL_KEYS = [
  { image: '[IMG_HERO_ATARDECER_HUACACHINA]', altKey: 'carousel.alt_0', titleKey: 'carousel.title_0', descKey: 'carousel.desc_0', link: '/experiencias', linkKey: 'carousel.cta_0' },
  { image: '[IMG_HERO_BUGGIES]', altKey: 'carousel.alt_1', titleKey: 'carousel.title_1', descKey: 'carousel.desc_1', link: '/experiencias', linkKey: 'carousel.cta_1' },
  { image: '[IMG_HERO_BUGGY_OASIS]', altKey: 'carousel.alt_2', titleKey: 'carousel.title_2', descKey: 'carousel.desc_2', link: '/experiencias', linkKey: 'carousel.cta_2' },
  { image: '[IMG_CAROUSEL_BUGGY]', altKey: 'carousel.alt_3', titleKey: 'carousel.title_3', descKey: 'carousel.desc_3', link: '/experiencias', linkKey: 'carousel.cta_3' },
  { image: '[IMG_CAROUSEL_SOLO]', altKey: 'carousel.alt_4', titleKey: 'carousel.title_4', descKey: 'carousel.desc_4', link: '/experiencias', linkKey: 'carousel.cta_4' },
  { image: '[IMG_BANNER_GRUPO]', altKey: 'carousel.alt_5', titleKey: 'carousel.title_5', descKey: 'carousel.desc_5', link: '/experiencias', linkKey: 'carousel.cta_5' },
  { image: '[IMG_CAROUSEL_BUGGY_SUNSET]', altKey: 'carousel.alt_6', titleKey: 'carousel.title_6', descKey: 'carousel.desc_6', link: '/experiencias', linkKey: 'carousel.cta_6' },
  { image: '[IMG_BANNER_DESERT]', altKey: 'carousel.alt_7', titleKey: 'carousel.title_7', descKey: 'carousel.desc_7', link: '/experiencias', linkKey: 'carousel.cta_7' },
  { image: '[IMG_HUACACHINA_NOCHE]', altKey: 'carousel.alt_8', titleKey: 'carousel.title_8', descKey: 'carousel.desc_8', link: '/experiencias', linkKey: 'carousel.cta_8' },
];

export default function Home() {
  const { t } = useTranslate();
  const { lang } = useTranslate();
  const { currency } = useCurrency();
  const [experiences, setExperiences] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Cargar experiencias desde la API
  useEffect(() => {
    api.get(`/experiences?limit=3&lang=${lang}`)
      .then(res => {
        const data = res.data.data;
        // Convertir formato API a formato esperado por el Home
        setExperiences(data.map(exp => ({
          id: exp.id,
          title: exp.name,
          description: exp.short_description || exp.description,
          price: exp.base_price,
          image: exp.image_placeholder || '[IMG_TUBULAR_DUNAS]',
          slug: exp.slug,
        })));
      })
      .catch(() => {
        // Fallback a mock data si la API falla
        setExperiences(MOCK_EXPERIENCES);
      });
  }, [lang]);

  // Cargar carrusel desde la API
  useEffect(() => {
    api.get(`/carousel?lang=${lang}`)
      .then(res => {
        const data = res.data.data;
        setCarouselSlides(data.map(slide => ({
          image: slide.image_placeholder,
          alt: slide.alt || slide.title,
          title: slide.title,
          description: slide.description,
          link: slide.link || '/experiencias',
          linkText: slide.ctaText || t('general.ver_mas'),
        })));
      })
      .catch(() => {
        // Fallback: usar los datos mock actuales con i18n
        setCarouselSlides(
          MOCK_CAROUSEL_KEYS.map(k => ({
            image: k.image,
            alt: t(k.altKey),
            title: t(k.titleKey),
            description: t(k.descKey),
            link: k.link,
            linkText: t(k.linkKey),
          }))
        );
      })
      .finally(() => setLoaded(true));
  }, [lang, t]);

  // Mientras carga, mostrar carrusel con datos mock como fallback visual inmediato
  const slides = carouselSlides.length > 0
    ? carouselSlides
    : MOCK_CAROUSEL_KEYS.map(k => ({
        image: k.image,
        alt: t(k.altKey),
        title: t(k.titleKey),
        description: t(k.descKey),
        link: k.link,
        linkText: t(k.linkKey),
      }));

  const displayExperiences = experiences.length > 0 ? experiences : MOCK_EXPERIENCES;

  return (
    <div className={styles.home}>
      <Carousel items={slides} interval={4000} className={styles.heroCarousel} />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>{t('home.badge')}</span>
            <h2 className={styles.sectionTitle}>{t('home.section_title')}</h2>
            <p className={styles.sectionSubtitle}>{t('home.section_sub')}</p>
          </div>
          <div className={styles.cards}>
            {displayExperiences.map(exp => (
              <Link key={exp.id} to={`/experiencias/${exp.slug}`} className={styles.card}>
                <div className={styles.cardImage}>
                  <Image src={exp.image} alt={exp.title} width={400} height={280} />
                  <div className={styles.cardBadge}>{formatPrice(exp.price, currency)}</div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{exp.title}</h3>
                  <p className={styles.cardDesc}>{exp.description}</p>
                  <span className={styles.cardLink}>{t('general.ver_mas')} →</span>
                </div>
              </Link>
            ))}
            {/* 4ta tarjeta: Ver más experiencias */}
            <Link to="/experiencias" className={styles.card}>
              <div className={styles.cardImage}>
                <Image src="[IMG_BUGGY_ADVENTURE]" alt={t('experiences.title')} width={400} height={280} />
                <div className={styles.moreOverlay}>
                  <span className={styles.moreIcon}>→</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{t('home.ver_mas')}</h3>
                <p className={styles.cardDesc}>{t('experiences.subtitle')}</p>
                <span className={styles.cardLink}>{t('general.ver_mas')} →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.serviceSection}>
        <div className={styles.serviceBg}>
          <Image src="[IMG_SECTION_DUNAS]" alt="Dunas de Huacachina" width={1400} height={500} className={styles.serviceBgImg} />
          <div className={styles.serviceOverlay} />
        </div>
        <div className={styles.container}>
          <div className={styles.serviceGrid}>
            <div className={styles.serviceInfo}>
              <span className={styles.sectionBadge}>{t('home.service_badge')}</span>
              <h2 className={styles.sectionTitle} style={{color:'white'}}>{t('home.service_title')}</h2>
              <p className={styles.sectionSubtitle} style={{color:'rgba(255,255,255,0.7)'}}>
                {t('home.service_sub')}
              </p>
              <ul className={styles.serviceList}>
                {[
                  { icon: '🚐', title: t('home.service_1'), desc: t('home.service_1_desc') },
                  { icon: '🏜️', title: t('home.service_2'), desc: t('home.service_2_desc') },
                  { icon: '🎢', title: t('home.service_3'), desc: t('home.service_3_desc') },
                  { icon: '🚐', title: t('home.service_4'), desc: t('home.service_4_desc') },
                ].map((s, i) => (
                  <li key={i} className={styles.serviceItem}>
                    <span className={styles.serviceIcon}>{s.icon}</span>
                    <div><strong>{s.title}</strong><p>{s.desc}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Clientes felices</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>1000+</span>
              <span className={styles.statLabel}>Tubulares realizados</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4.9★</span>
              <span className={styles.statLabel}>Calificación promedio</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>5 años</span>
              <span className={styles.statLabel}>De experiencia</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBg}>
          <Image src="[IMG_HUACACHINA_NOCHE]" alt="Huacachina de noche" width={1200} height={400} className={styles.ctaImage} />
          <div className={styles.ctaOverlay} />
        </div>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>¿Listo para la aventura?</h2>
          <p className={styles.ctaText}>Reserva ahora y vive una experiencia inolvidable en Huacachina.</p>
          <Link to="/experiencias" className={styles.btnPrimary}>Reservar Ahora</Link>
        </div>
      </section>
    </div>
  );
}
