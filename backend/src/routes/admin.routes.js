const { Router } = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDatabase } = require('../config/database');
const { successResponse } = require('../utils/apiResponse');

const router = Router();

// GET /admin/dashboard
router.get('/dashboard', verifyToken, requireRole('admin'), (req, res, next) => {
  try {
    const db = getDatabase();
    const today = new Date().toISOString().slice(0, 10);

    const totalBookingsToday = db.prepare(
      "SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = ?"
    ).get(today);

    const totalRevenueToday = db.prepare(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE DATE(created_at) = ? AND status != 'cancelled'"
    ).get(today);

    const activeEmergencies = db.prepare(
      "SELECT COUNT(*) as count FROM emergencies WHERE status IN ('open', 'in_progress')"
    ).get();

    const pendingBookings = db.prepare(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'"
    ).get();

    const upcomingSchedules = db.prepare(`
      SELECT s.*, e.name as experience_name
      FROM schedules s
      JOIN experiences e ON s.experience_id = e.id
      WHERE s.date >= ? AND s.status != 'cancelled'
      ORDER BY s.date ASC, s.time ASC
      LIMIT 10
    `).all(today);

    res.json(successResponse({
      total_bookings_today: totalBookingsToday.count,
      total_revenue_today: totalRevenueToday.total,
      active_emergencies: activeEmergencies.count,
      pending_bookings: pendingBookings.count,
      upcoming_schedules: upcomingSchedules
    }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
