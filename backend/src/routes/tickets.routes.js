const { Router } = require('express');
const { successResponse } = require('../utils/apiResponse');

const router = Router();

router.get('/', (req, res) => res.json(successResponse([])));

module.exports = router;
