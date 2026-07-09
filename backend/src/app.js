const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { initDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { limiter } = require('./middleware/rateLimiter');

const app = express();

// Inicializar base de datos automáticamente
initDatabase();

// Seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Compresión
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
app.use(limiter);

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.resolve(__dirname, '..', process.env.UPLOAD_DIR || '../uploads')));

// Rutas API
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Pacha Experiences API running', timestamp: new Date().toISOString() });
});

// Manejo de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
