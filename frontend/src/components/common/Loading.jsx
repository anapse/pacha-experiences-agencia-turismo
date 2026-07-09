import styles from './Loading.module.css';

export default function Loading({ fullScreen = false, text = 'Cargando...', size = 'md' }) {
  const content = (
    <div className={`${styles.loading} ${styles[`size--${size}`]} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );

  return content;
}
