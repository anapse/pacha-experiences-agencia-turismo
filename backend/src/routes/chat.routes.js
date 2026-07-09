const { Router } = require('express');
const { verifyToken } = require('../middleware/auth');
const { getDatabase } = require('../config/database');
const { successResponse } = require('../utils/apiResponse');
const { NotFoundError, AppError } = require('../middleware/errorHandler');

const router = Router();

// GET /conversations - Listar conversaciones del usuario autenticado
router.get('/conversations', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const conversations = db.prepare(`
      SELECT 
        cc.*,
        u1.name AS participant1_name,
        u1.avatar_url AS participant1_avatar,
        u1.role AS participant1_role,
        u2.name AS participant2_name,
        u2.avatar_url AS participant2_avatar,
        u2.role AS participant2_role,
        (SELECT COUNT(*) FROM chat_messages cm 
         WHERE cm.conversation_id = cc.id AND cm.sender_id != ? AND cm.is_read = 0
        ) AS unread_count
      FROM chat_conversations cc
      LEFT JOIN users u1 ON cc.participant1_id = u1.id
      LEFT JOIN users u2 ON cc.participant2_id = u2.id
      WHERE (cc.participant1_id = ? OR cc.participant2_id = ?)
        AND cc.is_active = 1
      ORDER BY cc.last_message_at DESC, cc.created_at DESC
    `).all(userId, userId, userId);

    res.json(successResponse(conversations));
  } catch (error) {
    next(error);
  }
});

// GET /conversations/:id/messages - Obtener mensajes de una conversación
router.get('/conversations/:id/messages', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const conversationId = req.params.id;

    // Verificar que el usuario es participante
    const conversation = db.prepare(`
      SELECT id FROM chat_conversations 
      WHERE id = ? AND (participant1_id = ? OR participant2_id = ?) AND is_active = 1
    `).get(conversationId, userId, userId);

    if (!conversation) {
      throw new NotFoundError('Conversación');
    }

    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const messages = db.prepare(`
      SELECT cm.*, u.name AS sender_name, u.avatar_url AS sender_avatar, u.role AS sender_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.conversation_id = ?
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?
    `).all(conversationId, parseInt(limit), offset);

    // Devolver en orden cronológico
    messages.reverse();

    res.json(successResponse(messages));
  } catch (error) {
    next(error);
  }
});

// POST /conversations - Crear conversación
router.post('/conversations', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { participantId, bookingId } = req.body;

    if (!participantId) {
      throw new AppError('Se requiere participantId', 400, 'VALIDATION_ERROR');
    }

    // Verificar que no exista ya una conversación entre ambos
    const existing = db.prepare(`
      SELECT id FROM chat_conversations 
      WHERE ((participant1_id = ? AND participant2_id = ?)
         OR (participant1_id = ? AND participant2_id = ?))
        AND is_active = 1
      LIMIT 1
    `).get(userId, participantId, participantId, userId);

    if (existing) {
      return res.json(successResponse(
        db.prepare('SELECT * FROM chat_conversations WHERE id = ?').get(existing.id),
        'Conversación existente'
      ));
    }

    const result = db.prepare(`
      INSERT INTO chat_conversations (participant1_id, participant2_id, booking_id, is_active, created_at)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).run(userId, participantId, bookingId || null);

    const conversation = db.prepare('SELECT * FROM chat_conversations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(successResponse(conversation, 'Conversación creada exitosamente'));
  } catch (error) {
    next(error);
  }
});

// POST /conversations/:id/messages - Enviar mensaje en conversación existente
router.post('/conversations/:id/messages', verifyToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const conversationId = req.params.id;

    // Verificar que el usuario es participante
    const conversation = db.prepare(`
      SELECT id FROM chat_conversations 
      WHERE id = ? AND (participant1_id = ? OR participant2_id = ?) AND is_active = 1
    `).get(conversationId, userId, userId);

    if (!conversation) {
      throw new NotFoundError('Conversación');
    }

    const { message, messageType = 'text' } = req.body;

    if (!message || !message.trim()) {
      throw new AppError('El mensaje no puede estar vacío', 400, 'VALIDATION_ERROR');
    }

    // Insertar mensaje
    const result = db.prepare(`
      INSERT INTO chat_messages (conversation_id, sender_id, message, message_type, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(conversationId, userId, message.trim(), messageType);

    // Actualizar last_message en conversación
    db.prepare(`
      UPDATE chat_conversations SET last_message = ?, last_message_at = datetime('now')
      WHERE id = ?
    `).run(message.trim(), conversationId);

    // Obtener el mensaje creado
    const savedMessage = db.prepare(`
      SELECT cm.*, u.name AS sender_name, u.avatar_url AS sender_avatar, u.role AS sender_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(successResponse(savedMessage, 'Mensaje enviado exitosamente'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
