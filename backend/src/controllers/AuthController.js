const { getDatabase } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { successResponse } = require('../utils/apiResponse');
const { AppError, UnauthorizedError } = require('../middleware/errorHandler');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const db = getDatabase();

      // Verificar si el email ya existe
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        throw new AppError('El email ya está registrado', 409, 'CONFLICT');
      }

      const passwordHash = await hashPassword(password);

      const result = db.prepare(
        'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)'
      ).run(name, email, passwordHash, phone || null, 'client');

      // Crear entrada en clients
      db.prepare('INSERT INTO clients (user_id) VALUES (?)').run(result.lastInsertRowid);

      const user = {
        id: result.lastInsertRowid,
        name,
        email,
        role: 'client'
      };

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.status(201).json(successResponse({
        user,
        accessToken,
        refreshToken
      }, 'Usuario registrado exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const db = getDatabase();

      const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
      if (!user) {
        throw new UnauthorizedError('Credenciales inválidas');
      }

      const validPassword = await comparePassword(password, user.password_hash);
      if (!validPassword) {
        throw new UnauthorizedError('Credenciales inválidas');
      }

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.json(successResponse({
        user: payload,
        accessToken,
        refreshToken
      }, 'Inicio de sesión exitoso'));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const decoded = verifyRefreshToken(refreshToken);

      const payload = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      res.json(successResponse({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }, 'Token renovado'));
    } catch (error) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }
  }

  async logout(req, res, next) {
    try {
      // En un sistema real, invalidaríamos el token en una blacklist
      // Por ahora, el cliente simplemente elimina el token
      res.json(successResponse(null, 'Sesión cerrada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const db = getDatabase();
      const user = db.prepare(
        'SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?'
      ).get(req.user.id);

      if (!user) {
        throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
      }

      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
