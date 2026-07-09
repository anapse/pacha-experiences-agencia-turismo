const { Router } = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDatabase } = require('../config/database');
const { successResponse } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

const router = Router();

// GET /experiences - Listar experiencias activas
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const { page = 1, limit, category, search, lang = 'es' } = req.query;

    let query = 'SELECT * FROM experiences WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY sort_order ASC';

    // Soporte para ?limit — si no está presente, devuelve todas
    if (limit) {
      const offset = (page - 1) * parseInt(limit);
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
    }

    const data = db.prepare(query).all(...params);

    // Si lang=en, mapear campos _en a nombres base
    if (lang === 'en') {
      for (const exp of data) {
        exp.name = exp.name_en || exp.name;
        exp.short_description = exp.short_description_en || exp.short_description;
      }
    }

    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
});

// GET /experiences/:slug - Obtener detalle
router.get('/:slug', (req, res, next) => {
  try {
    const db = getDatabase();
    const { lang = 'es' } = req.query;
    const experience = db.prepare(
      'SELECT * FROM experiences WHERE slug = ? AND is_active = 1'
    ).get(req.params.slug);

    if (!experience) {
      throw new AppError('Experiencia no encontrada', 404, 'NOT_FOUND');
    }

    // Si lang=en, mapear campos _en a nombres base (con fallback al español)
    if (lang === 'en') {
      experience.name = experience.name_en || experience.name;
      experience.short_description = experience.short_description_en || experience.short_description;
      experience.description = experience.description_en || experience.description;
      experience.includes = experience.includes_en || experience.includes;
      experience.requirements = experience.requirements_en || experience.requirements;
      experience.restrictions = experience.restrictions_en || experience.restrictions;
      experience.itinerary = experience.itinerary_en || experience.itinerary;
    }

    // Parsear JSON fields
    if (experience.includes) experience.includes = JSON.parse(experience.includes);
    if (experience.requirements) experience.requirements = JSON.parse(experience.requirements);
    if (experience.restrictions) experience.restrictions = JSON.parse(experience.restrictions);
    if (experience.itinerary) experience.itinerary = JSON.parse(experience.itinerary);

    res.json(successResponse(experience));
  } catch (error) {
    next(error);
  }
});

// GET /experiences/:id/schedules - Horarios disponibles
router.get('/:id/schedules', (req, res, next) => {
  try {
    const db = getDatabase();
    const { date } = req.query;

    let query = `SELECT s.*, v.name as vehicle_name, v.plate as vehicle_plate
                 FROM schedules s
                 LEFT JOIN vehicles v ON s.vehicle_id = v.id
                 WHERE s.experience_id = ?`;
    const params = [req.params.id];

    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    }

    query += ' ORDER BY s.date ASC, s.time ASC';

    const data = db.prepare(query).all(...params);
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
});

// POST / - Crear experiencia (admin)
router.post('/', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      name, description, short_description, duration,
      base_price, min_capacity, max_capacity, category,
      includes, requirements, restrictions, itinerary,
      image_placeholder, sort_order,
      name_en, short_description_en, description_en,
      includes_en, requirements_en, restrictions_en, itinerary_en
    } = req.body;

    // Generar slug automáticamente desde name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')   // remove special chars
      .replace(/\s+/g, '-')        // spaces to hyphens
      .replace(/-+/g, '-')         // collapse multiple hyphens
      .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens

    // Verificar slug único
    const existing = db.prepare('SELECT id FROM experiences WHERE slug = ?').get(slug);
    if (existing) {
      throw new AppError('Ya existe una experiencia con ese nombre', 409, 'SLUG_CONFLICT');
    }

    const stmt = db.prepare(`
      INSERT INTO experiences (name, slug, description, short_description, duration, base_price,
        min_capacity, max_capacity, category, includes, requirements, restrictions, itinerary,
        image_placeholder, sort_order,
        name_en, short_description_en, description_en, includes_en, requirements_en, restrictions_en, itinerary_en)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name, slug, description, short_description, duration, base_price,
      parseInt(min_capacity) || 1, parseInt(max_capacity) || 20, category || 'tubular',
      includes ? JSON.stringify(includes) : null,
      requirements ? JSON.stringify(requirements) : null,
      restrictions ? JSON.stringify(restrictions) : null,
      itinerary ? JSON.stringify(itinerary) : null,
      image_placeholder || null,
      parseInt(sort_order) || 0,
      name_en || null,
      short_description_en || null,
      description_en || null,
      includes_en ? JSON.stringify(includes_en) : null,
      requirements_en ? JSON.stringify(requirements_en) : null,
      restrictions_en ? JSON.stringify(restrictions_en) : null,
      itinerary_en ? JSON.stringify(itinerary_en) : null
    );

    const experience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(successResponse(experience, 'Experiencia creada exitosamente'));
  } catch (error) {
    next(error);
  }
});

// PUT /:id - Actualizar experiencia (admin)
router.put('/:id', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const experience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);

    if (!experience) {
      throw new AppError('Experiencia no encontrada', 404, 'NOT_FOUND');
    }

    const {
      name, description, short_description, duration,
      base_price, min_capacity, max_capacity, category,
      includes, requirements, restrictions, itinerary,
      image_placeholder, sort_order,
      name_en, short_description_en, description_en,
      includes_en, requirements_en, restrictions_en, itinerary_en
    } = req.body;

    // Generar slug si cambia el nombre
    let slug = experience.slug;
    if (name && name !== experience.name) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Verificar slug único (excluyendo el mismo ID)
      const existing = db.prepare('SELECT id FROM experiences WHERE slug = ? AND id != ?').get(slug, req.params.id);
      if (existing) {
        throw new AppError('Ya existe otra experiencia con ese nombre', 409, 'SLUG_CONFLICT');
      }
    }

    const stmt = db.prepare(`
      UPDATE experiences SET
        name = ?, slug = ?, description = ?, short_description = ?, duration = ?,
        base_price = ?, min_capacity = ?, max_capacity = ?, category = ?,
        includes = ?, requirements = ?, restrictions = ?, itinerary = ?,
        image_placeholder = ?, sort_order = ?,
        name_en = ?, short_description_en = ?, description_en = ?,
        includes_en = ?, requirements_en = ?, restrictions_en = ?, itinerary_en = ?
      WHERE id = ?
    `);

    stmt.run(
      name || experience.name,
      slug,
      description ?? experience.description,
      short_description ?? experience.short_description,
      duration ?? experience.duration,
      base_price ?? experience.base_price,
      parseInt(min_capacity) ?? experience.min_capacity,
      parseInt(max_capacity) ?? experience.max_capacity,
      category || experience.category,
      includes !== undefined ? JSON.stringify(includes) : experience.includes,
      requirements !== undefined ? JSON.stringify(requirements) : experience.requirements,
      restrictions !== undefined ? JSON.stringify(restrictions) : experience.restrictions,
      itinerary !== undefined ? JSON.stringify(itinerary) : experience.itinerary,
      image_placeholder !== undefined ? image_placeholder : experience.image_placeholder,
      parseInt(sort_order) ?? experience.sort_order,
      name_en !== undefined ? name_en : experience.name_en,
      short_description_en !== undefined ? short_description_en : experience.short_description_en,
      description_en !== undefined ? description_en : experience.description_en,
      includes_en !== undefined ? JSON.stringify(includes_en) : experience.includes_en,
      requirements_en !== undefined ? JSON.stringify(requirements_en) : experience.requirements_en,
      restrictions_en !== undefined ? JSON.stringify(restrictions_en) : experience.restrictions_en,
      itinerary_en !== undefined ? JSON.stringify(itinerary_en) : experience.itinerary_en,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
    res.json(successResponse(updated, 'Experiencia actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - Desactivar experiencia (soft delete, admin)
router.delete('/:id', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const experience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);

    if (!experience) {
      throw new AppError('Experiencia no encontrada', 404, 'NOT_FOUND');
    }

    db.prepare('UPDATE experiences SET is_active = 0 WHERE id = ?').run(req.params.id);

    res.json(successResponse(null, 'Experiencia desactivada exitosamente'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
