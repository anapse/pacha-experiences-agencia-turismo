const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Contador de usuarios activos
  io.activeUsers = 0;

  // Middleware de autenticación para sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Autenticación requerida'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket conectado: ${socket.user.name} (${socket.user.role})`);
    io.activeUsers++;

    // Unirse a sala personal
    socket.join(`user:${socket.user.id}`);

    // Unirse a sala por rol
    socket.join(`role:${socket.user.role}`);

    // Manejar eventos de chat
    require('./chat.handler')(io, socket);

    // Manejar eventos de emergencia
    require('./emergency.handler')(io, socket);

    // Manejar eventos de notificación
    require('./notification.handler')(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${socket.user.name}`);
      io.activeUsers = Math.max(0, io.activeUsers - 1);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO no está inicializado');
  }
  return io;
}

module.exports = { initSocket, getIO };
