import { Link } from 'react-router-dom';
import { SOCIAL_LINKS, SocialIcon } from '../../utils/socialIcons';
import { useTranslate } from '../../hooks/useTranslate';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useTranslate();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h3 className={styles.brandName}>✦ Pacha Experiences</h3>
            <p className={styles.brandDesc}>
              Vive la mejor experiencia en Huacachina. Tubulares, sandboard y más en el desierto peruano.
            </p>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>{t('footer.explore')}</h4>
            <Link to="/experiencias" className={styles.link}>Experiencias</Link>
            <Link to="/servicios" className={styles.link}>Servicios</Link>
            <Link to="/calendario" className={styles.link}>Calendario</Link>
            <Link to="/blog" className={styles.link}>Blog</Link>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>{t('footer.ayuda')}</h4>
            <Link to="/faq" className={styles.link}>FAQ</Link>
            <Link to="/contacto" className={styles.link}>{t('nav.contacto')}</Link>
            <Link to="/nosotros" className={styles.link}>Nosotros</Link>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Síguenos</h4>
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={s.label}
              >
                <SocialIcon name={s.key} size={14} />
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>© {new Date().getFullYear()} Pacha Experiences. {t('footer.derechos')}</p>
        </div>
      </div>
    </footer>
  );
}
