import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Image from '../components/common/Image';
import { useTranslate } from '../hooks/useTranslate';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatPrice } from '../utils/currency';
import styles from './Experiences.module.css';

export default function Experiences() {
  const { t, lang } = useTranslate();
  const { currency } = useCurrency();

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    api.get('/experiences', { params: { lang } })
      .then(res => setExperiences(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  const filteredExperiences = useMemo(() => {
    let result = [...experiences];

    // Search by name or description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        exp =>
          exp.name?.toLowerCase().includes(q) ||
          exp.short_description?.toLowerCase().includes(q),
      );
    }

    // Category filter
    if (category) {
      result = result.filter(exp => exp.category === category);
    }

    // Price range filter
    if (minPrice !== '') {
      result = result.filter(exp => Number(exp.base_price) >= Number(minPrice));
    }
    if (maxPrice !== '') {
      result = result.filter(exp => Number(exp.base_price) <= Number(maxPrice));
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => Number(a.base_price) - Number(b.base_price));
        break;
      case 'price_desc':
        result.sort((a, b) => Number(b.base_price) - Number(a.base_price));
        break;
      case 'duration':
        result.sort((a, b) => (a.duration || '').localeCompare(b.duration || ''));
        break;
      case 'popularity':
        result.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
        break;
    }

    return result;
  }, [experiences, searchQuery, category, minPrice, maxPrice, sortBy]);

  const categories = ['todas', 'tubular', 'combo', 'premium'];

  const hasActiveFilters = searchQuery || category || minPrice || maxPrice || sortBy;

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={styles.skeleton}>
                <div className={styles.skelImg} />
                <div className={styles.skelBody}>
                  <div className={styles.skelLine} style={{ width: '40%' }} />
                  <div className={styles.skelLine} style={{ width: '80%' }} />
                  <div className={styles.skelLine} style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('experiences.title')}</h1>
          <p className={styles.subtitle}>{t('experiences.subtitle')}</p>

          {/* ── Search Bar ── */}
          <div className={styles.searchBar}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t('experiences.buscar')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* ── Filters row ── */}
          <div className={styles.filtersRow}>
            {/* Category filters */}
            <div className={styles.filterGroup}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${(cat === 'todas' && !category) || category === cat ? styles.filterActive : ''}`}
                  onClick={() => setCategory(cat === 'todas' ? '' : cat)}
                >
                  {cat === 'todas'
                    ? t('experiences.todos')
                    : t(`experiences.${cat}`)}
                </button>
              ))}
            </div>

            {/* Price range */}
            <div className={styles.filterGroup}>
              <div className={styles.priceRange}>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="S/ 0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  min="0"
                />
                <span className={styles.priceSep}>—</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="S/ 999"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Sort */}
            <div className={styles.filterGroup}>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="">{t('experiences.ordenar')}</option>
                <option value="price_asc">{t('experiences.precio')} ↑</option>
                <option value="price_desc">{t('experiences.precio')} ↓</option>
                <option value="duration">{t('experiences.duracion')}</option>
                <option value="popularity">Popularidad</option>
              </select>
            </div>
          </div>

          {/* ── Results count ── */}
          <div className={styles.resultsInfo}>
            <span className={styles.count}>
              {filteredExperiences.length} {t('experiences.disponibles')}
            </span>
            {hasActiveFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                {t('experiences.limpiar')}
              </button>
            )}
          </div>
        </header>

        {/* ── Empty state ── */}
        {filteredExperiences.length === 0 ? (
          <div className={styles.empty}>
            <svg
              className={styles.emptyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p className={styles.emptyText}>{t('experiences.sin_resultados')}</p>
            <button className={styles.emptyClearBtn} onClick={clearFilters}>
              {t('experiences.limpiar')}
            </button>
          </div>
        ) : (
          /* ── Grid ── */
          <div className={styles.grid}>
            {filteredExperiences.map(exp => {
              const imgSrc = exp.image_placeholder
                ? `[${exp.image_placeholder}]`
                : '[IMG_HERO_ATARDECER_HUACACHINA]';

              return (
                <Link
                  key={exp.id}
                  to={`/experiencias/${exp.slug}`}
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    <Image src={imgSrc} alt={exp.name} width={400} height={260} />
                    <span className={styles.price}>
                      {formatPrice(exp.base_price, currency)}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.category}>{exp.category}</span>
                    <h2 className={styles.cardTitle}>{exp.name}</h2>
                    <p className={styles.cardDesc}>{exp.short_description}</p>
                    <div className={styles.cardMeta}>
                      <span>⏱ {exp.duration}</span>
                      <span>
                        👥 {exp.min_capacity}–{exp.max_capacity} pers.
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
