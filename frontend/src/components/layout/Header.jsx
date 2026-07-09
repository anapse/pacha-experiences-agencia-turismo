import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CURRENCIES } from '../../utils/currency';
import { LANGS } from '../../i18n';
import { useTranslate } from '../../hooks/useTranslate';
import styles from './Header.module.css';

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useI18n();
  const { currency, setCurrency, current } = useCurrency();
  const { t } = useTranslate();
  const [showLang, setShowLang] = useState(false);
  const [showCurr, setShowCurr] = useState(false);

  const links = [
    { path: '/', label: t('nav.inicio') },
    { path: '/experiencias', label: t('nav.experiencias') },
    { path: '/calendario', label: t('nav.calendario') },
    { path: '/faq', label: t('nav.faq') },
    { path: '/contacto', label: t('nav.contacto') },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>Pacha</span>
          <span className={styles.logoAccent}>Experiences</span>
        </Link>

        <nav className={styles.nav}>
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${pathname === link.path ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {/* Language selector */}
          <div className={styles.selectWrap}>
            <button className={styles.selectBtn} onClick={() => { setShowLang(!showLang); setShowCurr(false); }}>
              🌐 {lang.toUpperCase()}
            </button>
            {showLang && (
              <div className={styles.dropdown}>
                {LANGS.map(l => (
                  <button key={l.code} className={`${styles.dropdownItem} ${lang === l.code ? styles.dropdownActive : ''}`}
                    onClick={() => { setLang(l.code); setShowLang(false); }}>
                    {l.flag} <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency selector */}
          <div className={styles.selectWrap}>
            <button className={styles.selectBtn} onClick={() => { setShowCurr(!showCurr); setShowLang(false); }}>
              {current.symbol}
            </button>
            {showCurr && (
              <div className={styles.dropdown}>
                {CURRENCIES.map(c => (
                  <button key={c.code} className={`${styles.dropdownItem} ${currency === c.code ? styles.dropdownActive : ''}`}
                    onClick={() => { setCurrency(c.code); setShowCurr(false); }}>
                    {c.flag || '💵'} <span>{c.symbol} — {c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleTheme} className={styles.themeBtn} aria-label="Cambiar tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <Link to={user?.role === 'admin' ? '/admin' : '/mi-reserva'} className={styles.userBtn}>
                <span className={styles.avatar}>{user?.name?.[0]}</span>
                <span className={styles.userName}>{user?.name}</span>
              </Link>
              <button onClick={logout} className={styles.logoutBtn}>{t('nav.salir')}</button>
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>{t('nav.ingresar')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}
