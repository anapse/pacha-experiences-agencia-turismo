const { Router } = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getDatabase } = require('../config/database');
const { successResponse } = require('../utils/apiResponse');

const router = Router();

// GET /services - Listar servicios adicionales
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const { category } = req.query;

    let query = 'SELECT * FROM additional_services WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY sort_order ASC';
    const data = db.prepare(query).all(...params);
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
