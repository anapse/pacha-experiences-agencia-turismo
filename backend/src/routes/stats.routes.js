const router = require('express').Router();
const { getDatabase } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /visit — Pública: registrar una visita
router.post('/visit', (req, res) => {
  const db = getDatabase();
  const { path, referrer, session_id } = req.body;
  const ip = req.ip || req.connection?.remoteAddress;
  const user_agent = req.headers['user-agent'] || '';

  if (!path) {
    return res.status(400).json({ error: 'path es requerido' });
  }

  // Hora Perú (UTC-5)
  const now = new Date();
  const peruOffset = -5 * 60 * 60 * 1000;
  const today = new Date(now.getTime() + peruOffset).toISOString().split('T')[0];

  const insertVisit = db.prepare(`
    INSERT INTO page_views (path, ip, user_agent, referrer, session_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertVisit.run(path, ip, user_agent, referrer || null, session_id || null);

  // Actualizar o insertar daily_stats
  const upsertDaily = db.prepare(`
    INSERT INTO daily_stats (date, visits, pageviews)
    VALUES (?, 1, 1)
    ON CONFLICT(date) DO UPDATE SET
      visits = visits + 1,
      pageviews = pageviews + 1,
      updated_at = CURRENT_TIMESTAMP
  `);
  upsertDaily.run(today);

  res.json({ success: true });
});

// GET /live — Pública: usuarios activos desde Socket.IO
router.get('/live', (req, res) => {
  const io = req.app.get('io');
  const activeUsers = io && io.activeUsers !== undefined ? io.activeUsers : 0;
  res.json({ activeUsers });
});

// GET /summary — Requiere admin: resumen completo de estadísticas
router.get('/summary', verifyToken, requireRole('admin'), (req, res) => {
  const db = getDatabase();

  const totalVisits = db.prepare('SELECT COUNT(*) as count FROM page_views').get().count;
  const todayVisits = db.prepare(
    "SELECT COUNT(*) as count FROM page_views WHERE date(created_at, '-5 hours') = date('now', '-5 hours')"
  ).get().count;
  const todayUnique = db.prepare(
    "SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE date(created_at, '-5 hours') = date('now', '-5 hours') AND session_id IS NOT NULL"
  ).get().count;
  const last7days = db.prepare(
    'SELECT date, visits, pageviews FROM daily_stats ORDER BY date DESC LIMIT 7'
  ).all();

  const io = req.app.get('io');
  const activeUsers = io && io.activeUsers !== undefined ? io.activeUsers : 0;

  res.json({
    totalVisits,
    todayVisits,
    todayUnique,
    activeUsers,
    last7days: last7days.reverse()
  });
});

module.exports = router;
