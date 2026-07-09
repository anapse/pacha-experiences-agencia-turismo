import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './ConstructionModal.module.css';

export default function ConstructionModal() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const modalRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (isHome) {
      const timer = setTimeout(() => setVisible(true), 400);
      prevFocusRef.current = document.activeElement;
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isHome]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      if (prevFocusRef.current) prevFocusRef.current.focus();
    }, 300);
  }, []);

  const handleOverlay = useCallback((e) => {
    if (e.target === e.currentTarget) close();
  }, [close]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') close();
  }, [close]);

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
      setTimeout(() => modalRef.current?.focus(), 50);
      return () => {
        document.removeEventListener('keydown', handleKey);
        document.body.style.overflow = '';
      };
    }
  }, [visible, handleKey]);

  if (!visible) return null;

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.closing : ''}`}
      onClick={handleOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Aviso: sitio en construcción"
    >
      <div
        ref={modalRef}
        className={styles.modal}
        tabIndex={-1}
      >
        <button
          className={styles.closeBtn}
          onClick={close}
          aria-label="Cerrar aviso"
          type="button"
        >
          ✕
        </button>

        <div className={styles.icon}>🚧</div>

        <h2 className={styles.title}>
          Estamos construyendo una experiencia increíble
        </h2>

        <p className={styles.text}>
          Nuestro sitio web aún se encuentra en desarrollo.
        </p>
        <p className={styles.text}>
          Estamos trabajando para ofrecerte una plataforma rápida, moderna y segura donde podrás descubrir nuestros tours, experiencias, promociones y realizar tus reservas de forma sencilla.
        </p>
        <p className={styles.text}>
          Mientras terminamos los últimos detalles, algunas secciones podrían estar incompletas o en proceso de actualización.
        </p>
        <p className={styles.text}>
          Agradecemos tu visita y tu paciencia.
        </p>
        <p className={styles.textHighlight}>
          ¡Muy pronto estaremos listos para llevarte a vivir las mejores experiencias del Perú!
        </p>

        <button className={styles.cta} onClick={close} type="button">
          Explorar el sitio
        </button>

        <p className={styles.footer}>
          Si encuentras algún inconveniente durante tu visita, es posible que aún estemos realizando mejoras.
        </p>
      </div>
    </div>
  );
}
