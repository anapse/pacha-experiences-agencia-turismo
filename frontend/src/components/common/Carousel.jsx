import { useState, useEffect, useCallback, useRef } from 'react';
import Image from './Image';
import styles from './Carousel.module.css';

export default function Carousel({
  items = [],
  interval = 5000,
  className,
}) {
  const len = items.length;
  // slides = [último, ...originales, primero] para loop infinito
  const slides = len > 1 ? [items[len - 1], ...items, items[0]] : items;
  const total = slides.length;

  const [current, setCurrent] = useState(len > 1 ? 1 : 0);
  const [transitioning, setTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const trackRef = useRef(null);
  const nextRef = useRef(null);
  const currentRef = useRef(current);

  // Mantener currentRef sincronizado
  useEffect(() => { currentRef.current = current; }, [current]);

  const goTo = useCallback((i, smooth = true) => {
    if (!smooth) {
      setTransitioning(false);
      requestAnimationFrame(() => {
        setCurrent(i);
        requestAnimationFrame(() => setTransitioning(true));
      });
    } else {
      setCurrent(i);
    }
  }, []);

  const next = useCallback(() => {
    const c = currentRef.current;
    const total = items.length + 2; // len + 2 clones
    const nextIdx = c + 1;
    if (nextIdx >= total) {
      goTo(1, false);
    } else {
      setCurrent(nextIdx);
    }
  }, [goTo, items.length]);

  const prev = useCallback(() => {
    const c = currentRef.current;
    const len = items.length;
    const prevIdx = c - 1;
    if (prevIdx < 0) {
      goTo(len, false);
    } else {
      setCurrent(prevIdx);
    }
  }, [goTo, items.length]);

  // Detectar fin del track con transición → saltar al real
  useEffect(() => {
    if (!transitioning) return;
    if (current === 0) {
      // Llegó al clon del último (al inicio) → saltar al último real
      const t = setTimeout(() => goTo(len, false), 100);
      return () => clearTimeout(t);
    }
    if (current === total - 1) {
      // Llegó al clon del primero (al final) → saltar al primer real
      const t = setTimeout(() => goTo(1, false), 100);
      return () => clearTimeout(t);
    }
  }, [current, transitioning, len, total, goTo]);

  // Auto-play con ref estable para evitar reinicios del intervalo
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    if (isPaused || len <= 1) return;
    const id = setInterval(() => nextRef.current(), interval);
    return () => clearInterval(id);
  }, [isPaused, interval, len]);

  // Touch / swipe events
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) next();
    else if (diff < -threshold) prev();
    setIsPaused(false);
  }, [next, prev]);

  if (len === 0) return null;

  return (
    <div
      className={`${styles.carousel} ${className || ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={trackRef}
        className={styles.track}
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: transitioning ? 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        }}
      >
        {slides.map((item, i) => (
          <div key={i} className={styles.slide}>
            <Image
              src={item.image}
              alt={item.alt || ''}
              width={item.width || 1400}
              height={item.height || 600}
              className={styles.slideImage}
              priority={i === 1}
            />
            {(item.title || item.description) && (
              <div className={styles.overlay} />
            )}
            {(item.title || item.description) && (
              <div className={styles.overlayContent}>
                {item.title && <h3 className={styles.slideTitle}>{item.title}</h3>}
                {item.description && <p className={styles.slideDesc}>{item.description}</p>}
                {item.link && (
                  <a href={item.link} className={styles.slideLink}>
                    {item.linkText || 'Ver más'} →
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {len > 1 && (
        <>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Anterior">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Siguiente">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {len > 1 && (
        <div className={styles.dots}>
          {items.map((_, i) => {
            // Mapear current a índice real (current 1 = item 0, current 2 = item 1, etc.)
            const realIdx = current - 1;
            const activeIdx = realIdx < 0 ? len - 1 : realIdx >= len ? 0 : realIdx;
            return (
              <button
                key={i}
                className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`}
                onClick={() => goTo(i + 1)}
                aria-label={`Ir a slide ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
