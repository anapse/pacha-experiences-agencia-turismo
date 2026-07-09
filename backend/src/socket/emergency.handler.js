module.exports = function(io, socket) {
  // Reportar emergencia
  socket.on('emergency:report', async (data) => {
    const { bookingId, type, severity, description, location } = data;

    // Emitir a todos los admins
    io.to('role:admin').emit('emergency:alert', {
      reportedBy: socket.user.name,
      type,
      severity,
      description,
      location,
      bookingId,
      timestamp: new Date().toISOString()
    });

    // También a asesores
    io.to('role:advisor').emit('emergency:alert', {
      reportedBy: socket.user.name,
      type,
      severity,
      description,
      location,
      bookingId,
      timestamp: new Date().toISOString()
    });

    console.log(`🚨 EMERGENCIA ${severity.toUpperCase()}: ${description}`);
  });

  // Actualizar estado de emergencia
  socket.on('emergency:update', (data) => {
    const { emergencyId, status } = data;
    io.to('role:admin').emit('emergency:updated', {
      emergencyId,
      status,
      updatedBy: socket.user.name
    });
  });
};
