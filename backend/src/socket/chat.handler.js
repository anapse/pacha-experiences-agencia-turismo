const { getDatabase } = require('../config/database');

module.exports = function(io, socket) {
  // Unirse a una conversación
  socket.on('chat:join', (conversationId) => {
    socket.join(`chat:${conversationId}`);
  });

  // Enviar mensaje - guarda en DB y emite al room
  socket.on('chat:message', async (data) => {
    try {
      const db = getDatabase();
      const { conversationId, message, messageType = 'text', area } = data;

      if (!conversationId && !area) return;

      let targetConversationId = conversationId;

      // Si no hay conversationId, buscar o crear conversación por área + participante
      if (!targetConversationId && area && socket.user) {
        // Buscar un admin/advisor para el otro participante según el área
        let otherRole = 'advisor';
        if (area === 'transporte') otherRole = 'driver';
        else if (area === 'tubulares') otherRole = 'operator';

        const otherUser = db.prepare(`
          SELECT id FROM users 
          WHERE role = ? AND is_active = 1 
          ORDER BY RANDOM() LIMIT 1
        `).get(otherRole);

        if (otherUser) {
          // Buscar conversación existente entre estos dos usuarios para el área
          const existing = db.prepare(`
            SELECT id FROM chat_conversations 
            WHERE ((participant1_id = ? AND participant2_id = ?)
               OR (participant1_id = ? AND participant2_id = ?))
              AND is_active = 1
            LIMIT 1
          `).get(socket.user.id, otherUser.id, otherUser.id, socket.user.id);

          if (existing) {
            targetConversationId = existing.id;
          } else {
            // Crear nueva conversación
            const result = db.prepare(`
              INSERT INTO chat_conversations (participant1_id, participant2_id, is_active, created_at)
              VALUES (?, ?, 1, datetime('now'))
            `).run(socket.user.id, otherUser.id);
            targetConversationId = result.lastInsertRowid;
          }
        }
      }

      if (!targetConversationId) {
        socket.emit('chat:error', { message: 'No se pudo crear la conversación' });
        return;
      }

      // Guardar mensaje en DB
      const msgResult = db.prepare(`
        INSERT INTO chat_messages (conversation_id, sender_id, message, message_type, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(targetConversationId, socket.user.id, message, messageType || 'text');

      const messageId = msgResult.lastInsertRowid;

      // Actualizar last_message en la conversación
      db.prepare(`
        UPDATE chat_conversations SET last_message = ?, last_message_at = datetime('now')
        WHERE id = ?
      `).run(message, targetConversationId);

      // Obtener el mensaje guardado para emitirlo
      const savedMessage = db.prepare(`
        SELECT cm.*, u.name AS sender_name, u.avatar_url
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.id = ?
      `).get(messageId);

      // Emitir al room
      io.to(`chat:${targetConversationId}`).emit('chat:newMessage', {
        id: savedMessage.id,
        conversationId: targetConversationId,
        senderId: socket.user.id,
        senderName: socket.user.name,
        message: savedMessage.message,
        messageType: savedMessage.message_type,
        createdAt: savedMessage.created_at,
        isRead: false,
      });

      // Notificar al otro participante (sin incluir al remitente)
      socket.to(`chat:${targetConversationId}`).emit('chat:notification', {
        conversationId: targetConversationId,
        from: socket.user.name,
        message: message.substring(0, 100),
      });
    } catch (err) {
      console.error('Error al guardar mensaje de chat:', err);
      socket.emit('chat:error', { message: 'Error al enviar mensaje' });
    }
  });

  // Indicador de escritura
  socket.on('chat:typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(`chat:${conversationId}`).emit('chat:typing', {
      conversationId,
      userId: socket.user.id,
      userName: socket.user.name,
      isTyping,
    });
  });

  // Marcar como leído
  socket.on('chat:read', (data) => {
    try {
      const db = getDatabase();
      const { conversationId, messageId } = data;

      if (messageId) {
        // Marcar mensaje específico como leído
        db.prepare(`
          UPDATE chat_messages SET is_read = 1, read_at = datetime('now')
          WHERE id = ? AND sender_id != ?
        `).run(messageId, socket.user.id);
      } else if (conversationId) {
        // Marcar todos los mensajes no leídos como leídos
        db.prepare(`
          UPDATE chat_messages SET is_read = 1, read_at = datetime('now')
          WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
        `).run(conversationId, socket.user.id);
      }

      socket.to(`chat:${conversationId}`).emit('chat:read', {
        conversationId,
        messageId: messageId || null,
        readBy: socket.user.id,
        readByName: socket.user.name,
        readAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error al marcar mensaje como leído:', err);
    }
  });
};
