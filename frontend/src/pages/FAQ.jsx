import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import styles from './FAQ.module.css';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('todas');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.get('/faq')
      .then(res => setFaqs(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(faqs.map(f => f.category))];
    return ['todas', ...cats];
  }, [faqs]);

  const filtered = useMemo(() => {
    return faqs.filter(f => {
      const matchSearch = !search ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'todas' || f.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [faqs, search, activeCategory]);

  const toggleOpen = (id) => {
    setOpenId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeleton} style={{height: 60, marginBottom: 8}} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.badge}>❓ Ayuda</span>
          <h1 className={styles.title}>Preguntas Frecuentes</h1>
          <p className={styles.subtitle}>Encuentra respuestas a las dudas más comunes</p>

          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.search}
              placeholder="Buscar preguntas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'todas' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>🔍</p>
              <p className={styles.emptyText}>No encontramos preguntas para esa búsqueda</p>
              <button className={styles.clearBtn} onClick={() => { setSearch(''); setActiveCategory('todas'); }}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            filtered.map(faq => (
              <div key={faq.id} className={`${styles.item} ${openId === faq.id ? styles.itemOpen : ''}`}>
                <button className={styles.question} onClick={() => toggleOpen(faq.id)}>
                  <span className={styles.questionText}>{faq.question}</span>
                  <span className={`${styles.arrow} ${openId === faq.id ? styles.arrowOpen : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                <div className={`${styles.answer} ${openId === faq.id ? styles.answerOpen : ''}`}>
                  <p className={styles.answerText}>{faq.answer}</p>
                  {faq.category && (
                    <span className={styles.categoryTag}>{faq.category}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.contactCta}>
          <p className={styles.ctaText}>¿No encuentras lo que buscas?</p>
          <a href="/contacto" className={styles.ctaBtn}>Contáctanos</a>
        </div>
      </div>
    </div>
  );
}
