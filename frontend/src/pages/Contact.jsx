import { SOCIAL_LINKS, SocialIcon } from '../utils/socialIcons';
import { useTranslate } from '../hooks/useTranslate';
import styles from './Contact.module.css';

export default function Contact() {
  const { t } = useTranslate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('nav.contacto')}</h1>
          <p className={styles.subtitle}>{t('contact.subtitle')}</p>
        </header>

        <div className={styles.grid}>
          <div className={styles.infoColumn}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📍 {t('contact.location')}</h2>
              <p className={styles.cardText}>{t('footer.direccion')}<br/>Ica, Perú</p>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📱 {t('contact.phone')}</h2>
              <p className={styles.cardText}>+51 999 000 000</p>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>✉️ {t('contact.email')}</h2>
              <p className={styles.cardText}>info@pacha-experiences.com</p>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🕐 {t('contact.hours')}</h2>
              <p className={styles.cardText}>{t('contact.hours_desc')}</p>
            </div>

            <div className={styles.socialSection}>
              <h2 className={styles.cardTitle}>🌐 {t('contact.follow_us')}</h2>
              <div className={styles.socialList}>
                {SOCIAL_LINKS.map(s => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialItem}
                  >
                    <span className={styles.socialIconWrap}>
                      <SocialIcon name={s.key} size={18} />
                    </span>
                    <span className={styles.socialLabel}>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formColumn}>
            <div className={styles.formCard}>
              <h2 className={styles.cardTitle}>{t('contact.form_title')}</h2>
              <form className={styles.form} onSubmit={e => e.preventDefault()}>
                <div className={styles.field}>
                  <label className={styles.label}>{t('contact.form_name')}</label>
                  <input type="text" className={styles.input} placeholder={t('contact.form_name_ph')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t('contact.form_email')}</label>
                  <input type="email" className={styles.input} placeholder={t('contact.form_email_ph')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t('contact.form_message')}</label>
                  <textarea className={styles.textarea} rows={5} placeholder={t('contact.form_message_ph')} />
                </div>
                <button type="submit" className={styles.submitBtn}>{t('contact.form_send')}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
