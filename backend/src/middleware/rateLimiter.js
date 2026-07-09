const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiter, authLimiter };
