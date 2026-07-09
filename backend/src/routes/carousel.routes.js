const { Router } = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDatabase } = require('../config/database');
const { successResponse } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

const router = Router();

// GET /carousel — Público. Acepta ?lang=es|en
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const { lang = 'es' } = req.query;

    const slides = db.prepare(
      'SELECT * FROM carousel_slides WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();

    // Si lang=en, mapear campos _en a nombres base (con fallback al español)
    if (lang === 'en') {
      for (const slide of slides) {
        slide.title = slide.title_en || slide.title_es;
        slide.description = slide.desc_en || slide.desc_es;
        slide.ctaText = slide.cta_en || slide.cta_es;
        // Limpiar campos _en para no enviarlos duplicados
        delete slide.title_en;
        delete slide.title_es;
        delete slide.desc_en;
        delete slide.desc_es;
        delete slide.cta_en;
        delete slide.cta_es;
      }
    } else {
      // lang=es — devolver campos base con nombres amigables
      for (const slide of slides) {
        slide.title = slide.title_es;
        slide.description = slide.desc_es;
        slide.ctaText = slide.cta_es;
        delete slide.title_en;
        delete slide.title_es;
        delete slide.desc_en;
        delete slide.desc_es;
        delete slide.cta_en;
        delete slide.cta_es;
      }
    }

    res.json(successResponse(slides));
  } catch (error) {
    next(error);
  }
});

// POST / — Admin: Crear slide
router.post('/', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      image_placeholder, title_es, title_en, desc_es, desc_en,
      cta_es, cta_en, link, sort_order
    } = req.body;

    if (!image_placeholder || !title_es || !desc_es) {
      throw new AppError('image_placeholder, title_es y desc_es son requeridos', 400, 'VALIDATION');
    }

    const stmt = db.prepare(`
      INSERT INTO carousel_slides (image_placeholder, title_es, title_en, desc_es, desc_en,
        cta_es, cta_en, link, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      image_placeholder,
      title_es,
      title_en || null,
      desc_es,
      desc_en || null,
      cta_es || 'Ver más',
      cta_en || 'View more',
      link || '/experiencias',
      parseInt(sort_order) || 0
    );

    const slide = db.prepare('SELECT * FROM carousel_slides WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(successResponse(slide, 'Slide creado exitosamente'));
  } catch (error) {
    next(error);
  }
});

// PUT /:id — Admin: Actualizar slide
router.put('/:id', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const slide = db.prepare('SELECT * FROM carousel_slides WHERE id = ?').get(req.params.id);

    if (!slide) {
      throw new AppError('Slide no encontrado', 404, 'NOT_FOUND');
    }

    const {
      image_placeholder, title_es, title_en, desc_es, desc_en,
      cta_es, cta_en, link, sort_order, is_active
    } = req.body;

    const stmt = db.prepare(`
      UPDATE carousel_slides SET
        image_placeholder = ?, title_es = ?, title_en = ?, desc_es = ?, desc_en = ?,
        cta_es = ?, cta_en = ?, link = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `);

    stmt.run(
      image_placeholder ?? slide.image_placeholder,
      title_es ?? slide.title_es,
      title_en !== undefined ? title_en : slide.title_en,
      desc_es ?? slide.desc_es,
      desc_en !== undefined ? desc_en : slide.desc_en,
      cta_es ?? slide.cta_es,
      cta_en ?? slide.cta_en,
      link ?? slide.link,
      parseInt(sort_order) ?? slide.sort_order,
      is_active !== undefined ? (is_active ? 1 : 0) : slide.is_active,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM carousel_slides WHERE id = ?').get(req.params.id);
    res.json(successResponse(updated, 'Slide actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
});

// DELETE /:id — Admin: Desactivar slide (soft delete)
router.delete('/:id', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const slide = db.prepare('SELECT * FROM carousel_slides WHERE id = ?').get(req.params.id);

    if (!slide) {
      throw new AppError('Slide no encontrado', 404, 'NOT_FOUND');
    }

    db.prepare('UPDATE carousel_slides SET is_active = 0 WHERE id = ?').run(req.params.id);

    res.json(successResponse(null, 'Slide desactivado exitosamente'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
