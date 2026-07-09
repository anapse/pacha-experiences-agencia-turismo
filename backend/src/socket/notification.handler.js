module.exports = function(io, socket) {
  // Notificar nueva reserva
  socket.on('notification:bookingCreated', (data) => {
    io.to('role:admin').emit('notification:newBooking', {
      bookingId: data.bookingId,
      clientName: data.clientName,
      timestamp: new Date().toISOString()
    });
    io.to('role:advisor').emit('notification:newBooking', {
      bookingId: data.bookingId,
      clientName: data.clientName,
      timestamp: new Date().toISOString()
    });
  });

  // Notificar pago
  socket.on('notification:paymentReceived', (data) => {
    io.to('role:admin').emit('notification:payment', {
      bookingId: data.bookingId,
      amount: data.amount,
      method: data.method,
      timestamp: new Date().toISOString()
    });
  });

  // Notificar cancelación
  socket.on('notification:bookingCancelled', (data) => {
    io.to('role:admin').emit('notification:cancel', {
      bookingId: data.bookingId,
      reason: data.reason,
      timestamp: new Date().toISOString()
    });
  });
};
