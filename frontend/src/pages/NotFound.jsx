import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Página no encontrada</h2>
      <p className={styles.text}>
        La página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className={styles.link}>Volver al inicio</Link>
    </div>
  );
}
