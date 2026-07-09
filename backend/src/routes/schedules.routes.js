const { Router } = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDatabase } = require('../config/database');
const { successResponse } = require('../utils/apiResponse');
const { AppError, NotFoundError, ConflictError } = require('../middleware/errorHandler');

const router = Router();

// GET / - Listar schedules con filtros
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const { experience_id, date_from, date_to, status } = req.query;

    let query = `
      SELECT 
        s.*,
        e.name AS experience_name,
        e.slug AS experience_slug,
        e.base_price AS experience_price,
        v.name AS vehicle_name,
        v.plate AS vehicle_plate,
        v.type AS vehicle_type,
        d.name AS driver_name,
        o.name AS operator_name
      FROM schedules s
      LEFT JOIN experiences e ON s.experience_id = e.id
      LEFT JOIN vehicles v ON s.vehicle_id = v.id
      LEFT JOIN users d ON s.driver_id = d.id
      LEFT JOIN users o ON s.operator_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (experience_id) {
      query += ' AND s.experience_id = ?';
      params.push(experience_id);
    }
    if (date_from) {
      query += ' AND s.date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND s.date <= ?';
      params.push(date_to);
    }
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.date ASC, s.time ASC';

    const data = db.prepare(query).all(...params);
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
});

// GET /by-date/:date - Obtener schedules agrupados por experiencia para una fecha
router.get('/by-date/:date', (req, res, next) => {
  try {
    const db = getDatabase();
    const { date } = req.params;

    // Obtener schedules activos para la fecha con JOIN a experiencias
    const schedules = db.prepare(`
      SELECT 
        s.*,
        e.name AS experience_name,
        e.slug AS experience_slug,
        e.duration AS experience_duration,
        e.base_price AS experience_price,
        e.short_description AS experience_description,
        e.category AS experience_category,
        e.image_placeholder AS experience_image,
        (s.max_capacity - s.current_bookings) AS available_spots,
        v.name AS vehicle_name,
        v.plate AS vehicle_plate,
        d.name AS driver_name,
        o.name AS operator_name
      FROM schedules s
      JOIN experiences e ON s.experience_id = e.id
      LEFT JOIN vehicles v ON s.vehicle_id = v.id
      LEFT JOIN users d ON s.driver_id = d.id
      LEFT JOIN users o ON s.operator_id = o.id
      WHERE s.date = ?
        AND s.status IN ('pending', 'confirmed', 'full')
      ORDER BY e.sort_order ASC, s.time ASC
    `).all(date);

    // Agrupar por experiencia
    const grouped = {};
    for (const schedule of schedules) {
      const expId = schedule.experience_id;
      if (!grouped[expId]) {
        grouped[expId] = {
          id: expId,
          name: schedule.experience_name,
          slug: schedule.experience_slug,
          duration: schedule.experience_duration,
          base_price: schedule.experience_price,
          description: schedule.experience_description,
          category: schedule.experience_category,
          image: schedule.experience_image,
          schedules: [],
        };
      }
      grouped[expId].schedules.push({
        id: schedule.id,
        time: schedule.time,
        min_capacity: schedule.min_capacity,
        max_capacity: schedule.max_capacity,
        current_bookings: schedule.current_bookings,
        available_spots: schedule.available_spots,
        status: schedule.status,
        vehicle_name: schedule.vehicle_name,
        vehicle_plate: schedule.vehicle_plate,
        driver_name: schedule.driver_name,
        operator_name: schedule.operator_name,
        notes: schedule.notes,
      });
    }

    const result = Object.values(grouped);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
});

// POST / - Crear schedule (admin)
router.post('/', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      experience_id, date, time, min_capacity, max_capacity,
      vehicle_id, driver_id, operator_id, notes
    } = req.body;

    // Validar experiencia existe
    const experience = db.prepare('SELECT id FROM experiences WHERE id = ?').get(experience_id);
    if (!experience) {
      throw new NotFoundError('Experiencia');
    }

    const stmt = db.prepare(`
      INSERT INTO schedules (experience_id, date, time, min_capacity, max_capacity,
        current_bookings, status, vehicle_id, driver_id, operator_id, notes)
      VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?, ?, ?)
    `);

    const result = stmt.run(
      experience_id, date, time,
      min_capacity || null, max_capacity || null,
      vehicle_id || null, driver_id || null,
      operator_id || null, notes || null
    );

    const schedule = db.prepare(`
      SELECT s.*, e.name AS experience_name
      FROM schedules s
      LEFT JOIN experiences e ON s.experience_id = e.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(successResponse(schedule, 'Schedule creado exitosamente'));
  } catch (error) {
    next(error);
  }
});

// PUT /:id - Actualizar schedule (admin)
router.put('/:id', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);

    if (!schedule) {
      throw new NotFoundError('Schedule');
    }

    const {
      experience_id, date, time, min_capacity, max_capacity,
      status, vehicle_id, driver_id, operator_id, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE schedules SET
        experience_id = ?, date = ?, time = ?, min_capacity = ?,
        max_capacity = ?, status = ?, vehicle_id = ?,
        driver_id = ?, operator_id = ?, notes = ?
      WHERE id = ?
    `);

    stmt.run(
      experience_id ?? schedule.experience_id,
      date ?? schedule.date,
      time ?? schedule.time,
      min_capacity ?? schedule.min_capacity,
      max_capacity ?? schedule.max_capacity,
      status || schedule.status,
      vehicle_id !== undefined ? vehicle_id : schedule.vehicle_id,
      driver_id !== undefined ? driver_id : schedule.driver_id,
      operator_id !== undefined ? operator_id : schedule.operator_id,
      notes !== undefined ? notes : schedule.notes,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT s.*, e.name AS experience_name
      FROM schedules s
      LEFT JOIN experiences e ON s.experience_id = e.id
      WHERE s.id = ?
    `).get(req.params.id);

    res.json(successResponse(updated, 'Schedule actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - Cancelar schedule (soft delete, admin)
router.delete('/:id', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);

    if (!schedule) {
      throw new NotFoundError('Schedule');
    }

    db.prepare("UPDATE schedules SET status = 'cancelled' WHERE id = ?").run(req.params.id);

    res.json(successResponse(null, 'Schedule cancelado exitosamente'));
  } catch (error) {
    next(error);
  }
});

// POST /:id/book - Incrementar current_bookings
router.post('/:id/book', (req, res, next) => {
  try {
    const db = getDatabase();
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);

    if (!schedule) {
      throw new NotFoundError('Schedule');
    }

    if (schedule.status === 'cancelled') {
      throw new ConflictError('El schedule está cancelado');
    }

    if (schedule.current_bookings >= schedule.max_capacity) {
      throw new ConflictError('El schedule está lleno (cupo máximo alcanzado)');
    }

    const newBookings = schedule.current_bookings + 1;
    const newStatus = newBookings >= schedule.max_capacity ? 'full' : schedule.status;

    db.prepare(`
      UPDATE schedules SET current_bookings = ?, status = ? WHERE id = ?
    `).run(newBookings, newStatus, req.params.id);

    const updated = db.prepare(`
      SELECT s.*, e.name AS experience_name
      FROM schedules s
      LEFT JOIN experiences e ON s.experience_id = e.id
      WHERE s.id = ?
    `).get(req.params.id);

    res.json(successResponse(updated, 'Reserva registrada exitosamente'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
