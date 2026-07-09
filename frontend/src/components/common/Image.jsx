import { useState, useCallback } from 'react';
import { resolveImage } from '../../utils/imageMap';
import styles from './Image.module.css';

export default function Image({
  src,
  alt = '',
  width,
  height,
  aspectRatio,
  className,
  objectFit = 'cover',
  priority = false,
  ...props
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const resolvedSrc = src?.startsWith('[') ? resolveImage(src) : src;

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
  }, []);

  if (!resolvedSrc) return null;

  return (
    <div
      className={`${styles.wrapper} ${className || ''} ${!loaded ? styles.loading : styles.done}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
      }}
    >
      <img
        src={resolvedSrc}
        alt={alt}
        className={`${styles.img} ${loaded ? styles.visible : ''}`}
        style={{ objectFit }}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {error && (
        <div className={styles.error}>
          <span>🖼️</span>
        </div>
      )}
    </div>
  );
}
