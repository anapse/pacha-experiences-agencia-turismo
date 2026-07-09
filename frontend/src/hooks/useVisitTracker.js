import { useEffect } from 'react';
import { api } from '../services/api';

export default function useVisitTracker() {
  useEffect(() => {
    // Obtener o generar session_id
    let sessionId = localStorage.getItem('pacha_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem('pacha_session', sessionId);
    }

    // Enviar visita al backend
    api.post('/stats/visit', {
      path: window.location.pathname,
      referrer: document.referrer || '',
      session_id: sessionId,
    }).catch(() => {
      // Fallo silencioso — no romper la app si el backend no responde
    });
  }, []); // Solo una vez al montar la app
}
