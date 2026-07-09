const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middleware/auth');

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('phone').optional().trim()
], validate, (req, res, next) => controller.register(req, res, next));

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida')
], validate, (req, res, next) => controller.login(req, res, next));

router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token requerido')
], validate, (req, res, next) => controller.refresh(req, res, next));

router.post('/logout', verifyToken, (req, res, next) => controller.logout(req, res, next));

router.get('/me', verifyToken, (req, res, next) => controller.me(req, res, next));

module.exports = router;
