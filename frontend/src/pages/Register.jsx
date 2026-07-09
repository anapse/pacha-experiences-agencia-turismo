import { Link } from 'react-router-dom';
import styles from './Register.module.css';

export default function Register() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Regístrate para gestionar tus reservas</p>
        </div>

        <p className={styles.placeholder}>
          El formulario de registro completo estará disponible en la siguiente fase.
        </p>

        <p className={styles.footer}>
          ¿Ya tienes cuenta? <Link to="/login" className={styles.link}>Inicia sesión</Link>
        </p>

        <div className={styles.demo}>
          <p className={styles.demoTitle}>Demo admin:</p>
          <p className={styles.demoText}>admin@pacha.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
