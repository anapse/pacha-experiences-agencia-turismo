const { Router } = require('express');
const { getDatabase } = require('../config/database');
const { successResponse } = require('../utils/apiResponse');

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const { category } = req.query;

    let query = 'SELECT * FROM faq_items WHERE is_active = 1';
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
