const { Router } = require('express');
const { successResponse } = require('../utils/apiResponse');

const router = Router();

router.get('/', (req, res) => res.json(successResponse([])));
router.put('/:id', (req, res) => res.json(successResponse(null)));

module.exports = router;
