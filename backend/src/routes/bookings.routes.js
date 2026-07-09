const { Router } = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDatabase } = require('../config/database');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

const router = Router();

// GET /bookings - Listar reservas (protegido)
router.get('/', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const { status, date_from, date_to, page = 1, limit = 20 } = req.query;

    let query = `SELECT b.*, u.name as client_name, e.name as experience_name
                 FROM bookings b
                 JOIN clients c ON b.client_id = c.id
                 JOIN users u ON c.user_id = u.id
                 JOIN schedules s ON b.schedule_id = s.id
                 JOIN experiences e ON s.experience_id = e.id
                 WHERE 1=1`;
    const params = [];

    // Filtrar por rol
    if (req.user.role === 'client') {
      query += ' AND c.user_id = ?';
      params.push(req.user.id);
    }

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (date_from) {
      query += ' AND s.date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND s.date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const data = db.prepare(query).all(...params);
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
});

// GET /bookings/:id - Detalle de reserva
router.get('/:id', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const booking = db.prepare(`
      SELECT b.*, u.name as client_name, u.email as client_email, u.phone as client_phone,
             e.name as experience_name, e.slug as experience_slug,
             s.date, s.time,
             v.name as vehicle_name
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN schedules s ON b.schedule_id = s.id
      JOIN experiences e ON s.experience_id = e.id
      LEFT JOIN vehicles v ON s.vehicle_id = v.id
      WHERE b.id = ?
    `).get(req.params.id);

    if (!booking) {
      throw new AppError('Reserva no encontrada', 404, 'NOT_FOUND');
    }

    // Servicios adicionales
    booking.services = db.prepare(`
      SELECT bs.*, a_s.name as service_name, a_s.category
      FROM booking_services bs
      JOIN additional_services a_s ON bs.service_id = a_s.id
      WHERE bs.booking_id = ?
    `).all(req.params.id);

    // Pagos
    booking.payments = db.prepare(`
      SELECT * FROM payments WHERE booking_id = ?
    `).all(req.params.id);

    // Tickets
    booking.tickets = db.prepare(`
      SELECT * FROM tickets WHERE booking_id = ?
    `).all(req.params.id);

    res.json(successResponse(booking));
  } catch (error) {
    next(error);
  }
});

// POST /bookings - Crear reserva
router.post('/', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const { schedule_id, pax_count, services = [], notes, source = 'web' } = req.body;

    // Validar horario
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(schedule_id);
    if (!schedule) {
      throw new AppError('Horario no encontrado', 404, 'NOT_FOUND');
    }
    if (schedule.status === 'full' || schedule.status === 'cancelled') {
      throw new AppError('Horario no disponible', 409, 'CONFLICT');
    }

    // Validar cupos
    const newTotal = schedule.current_bookings + pax_count;
    if (newTotal > schedule.max_capacity) {
      throw new AppError('Cupo insuficiente', 409, 'CONFLICT');
    }

    // Obtener cliente
    const client = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(req.user.id);
    if (!client) {
      throw new AppError('Perfil de cliente no encontrado', 404, 'NOT_FOUND');
    }

    // Calcular total
    const experience = db.prepare('SELECT base_price FROM experiences WHERE id = ?').get(schedule.experience_id);
    let total = experience.base_price * pax_count;

    // Calcular servicios adicionales
    if (services.length > 0) {
      const serviceIds = services.map(s => s.service_id);
      const placeholders = serviceIds.map(() => '?').join(',');
      const servicePrices = db.prepare(
        `SELECT id, price FROM additional_services WHERE id IN (${placeholders})`
      ).all(...serviceIds);

      const priceMap = {};
      servicePrices.forEach(sp => { priceMap[sp.id] = sp.price; });

      for (const svc of services) {
        if (!priceMap[svc.service_id]) {
          throw new AppError(`Servicio ${svc.service_id} no encontrado`, 404, 'NOT_FOUND');
        }
        total += priceMap[svc.service_id] * (svc.quantity || 1);
      }
    }

    // Generar código de reserva
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c + 1;
    const bookingCode = `PCHA-${dateStr}-${String(count).padStart(3, '0')}`;

    // Crear reserva
    const result = db.prepare(`
      INSERT INTO bookings (booking_code, client_id, schedule_id, advisor_id, pax_count, total_amount, source, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(bookingCode, client.id, schedule_id, req.user.role === 'advisor' ? req.user.id : null, pax_count, total, source, notes);

    const bookingId = result.lastInsertRowid;

    // Agregar servicios adicionales
    if (services.length > 0) {
      const insertService = db.prepare(
        'INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)'
      );
      for (const svc of services) {
        const price = db.prepare('SELECT price FROM additional_services WHERE id = ?').get(svc.service_id).price;
        const qty = svc.quantity || 1;
        insertService.run(bookingId, svc.service_id, qty, price, price * qty);
      }
    }

    // Actualizar cupos
    db.prepare('UPDATE schedules SET current_bookings = ? WHERE id = ?').run(newTotal, schedule_id);

    // Verificar si el horario se llenó
    if (newTotal >= schedule.max_capacity) {
      db.prepare("UPDATE schedules SET status = 'full' WHERE id = ?").run(schedule_id);
    }

    // Generar ticket
    const ticketCode = `TCK-${bookingCode}`;
    db.prepare(`
      INSERT INTO tickets (booking_id, ticket_code, valid_until)
      VALUES (?, ?, ?)
    `).run(bookingId, ticketCode, schedule.date);

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    res.status(201).json(successResponse(booking, 'Reserva creada exitosamente'));
  } catch (error) {
    next(error);
  }
});

// PUT /bookings/:id - Actualizar estado
router.put('/:id', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const { status, notes } = req.body;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      throw new AppError('Reserva no encontrada', 404, 'NOT_FOUND');
    }

    if (status) {
      db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, req.params.id);
    }
    if (notes) {
      db.prepare('UPDATE bookings SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(notes, req.params.id);
    }

    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json(successResponse(updated, 'Reserva actualizada'));
  } catch (error) {
    next(error);
  }
});

// DELETE /bookings/:id - Cancelar reserva
router.delete('/:id', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      throw new AppError('Reserva no encontrada', 404, 'NOT_FOUND');
    }

    // Liberar cupos
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(booking.schedule_id);
    if (schedule) {
      const newCount = Math.max(0, schedule.current_bookings - booking.pax_count);
      db.prepare('UPDATE schedules SET current_bookings = ?, status = ? WHERE id = ?')
        .run(newCount, 'confirmed', booking.schedule_id);
    }

    db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(req.params.id);

    res.json(successResponse(null, 'Reserva cancelada'));
  } catch (error) {
    next(error);
  }
});

// POST /bookings/:id/services - Agregar servicio a reserva
router.post('/:id/services', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const { service_id, quantity = 1 } = req.body;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      throw new AppError('Reserva no encontrada', 404, 'NOT_FOUND');
    }

    const service = db.prepare('SELECT * FROM additional_services WHERE id = ?').get(service_id);
    if (!service) {
      throw new AppError('Servicio no encontrado', 404, 'NOT_FOUND');
    }

    const subtotal = service.price * quantity;
    db.prepare(
      'INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)'
    ).run(req.params.id, service_id, quantity, service.price, subtotal);

    // Recalcular total
    const totalServices = db.prepare(
      'SELECT SUM(subtotal) as total FROM booking_services WHERE booking_id = ?'
    ).get(req.params.id);

    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(booking.schedule_id);
    const experience = db.prepare('SELECT base_price FROM experiences WHERE id = ?').get(schedule.experience_id);
    const newTotal = (experience.base_price * booking.pax_count) + totalServices.total;

    db.prepare('UPDATE bookings SET total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newTotal, req.params.id);

    res.status(201).json(successResponse(null, 'Servicio agregado'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
