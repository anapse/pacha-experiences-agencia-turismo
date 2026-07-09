const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token de acceso requerido', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expirado', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('No autenticado', 401, 'UNAUTHORIZED');
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError('No tienes permisos para esta acción', 403, 'FORBIDDEN');
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
