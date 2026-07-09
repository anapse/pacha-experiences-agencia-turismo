import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslate } from '../../hooks/useTranslate';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import styles from './ChatWidget.module.css';

/* ── Mock data (fallback) ── */
const AVATARS = {
  sofia: { emoji: '👩‍💼', color: '#8b5cf6' },
  carlos: { emoji: '👨‍🔧', color: '#0ea5e9' },
  miguel: { emoji: '👨‍🌾', color: '#f59e0b' },
  ana: { emoji: '👩‍💻', color: '#10b981' },
};

const MOCK_MESSAGES = {
  oficina: [
    { id: 1, sender: 'Sofía', avatar: AVATARS.sofia, text: '¡Buenos días! 😊 ¿En qué puedo ayudarte hoy?', time: '09:30', type: 'received' },
    { id: 2, sender: 'Sofía', avatar: AVATARS.sofia, text: 'Puedes consultar disponibilidad o resolver dudas sobre tus reservas directamente aquí.', time: '09:31', type: 'received' },
  ],
  transporte: [
    { id: 3, sender: 'Carlos', avatar: AVATARS.carlos, text: '🚐 Nuestros traslados salen desde la Plaza de Armas de Ica.', time: '10:00', type: 'received' },
    { id: 4, sender: 'Carlos', avatar: AVATARS.carlos, text: 'Horarios disponibles: 8:00 AM, 10:00 AM, 1:00 PM y 4:00 PM.', time: '10:01', type: 'received' },
    { id: 5, sender: 'Carlos', avatar: AVATARS.carlos, text: 'El viaje dura aproximadamente 20 minutos hasta las dunas.', time: '10:02', type: 'received' },
  ],
  tubulares: [
    { id: 6, sender: 'Miguel', avatar: AVATARS.miguel, text: '🏜️ ¡Prepárate para la adrenalina!', time: '11:15', type: 'received' },
    { id: 7, sender: 'Miguel', avatar: AVATARS.miguel, text: 'Nuestros tubulares duran 30 minutos de pura emoción por las dunas más altas.', time: '11:16', type: 'received' },
    { id: 8, sender: 'Miguel', avatar: AVATARS.miguel, text: 'Recomendamos llevar ropa cómoda y bloqueador solar ☀️', time: '11:17', type: 'received' },
  ],
  reservas: [
    { id: 9, sender: 'Ana', avatar: AVATARS.ana, text: '📅 ¿Listo para reservar?', time: '12:00', type: 'received' },
    { id: 10, sender: 'Ana', avatar: AVATARS.ana, text: 'Puedes hacer tu reserva online y elegir el día que prefieras.', time: '12:01', type: 'received' },
    { id: 11, sender: 'Ana', avatar: AVATARS.ana, text: 'Si necesitas ayuda con el proceso, escríbenos y te guiamos paso a paso.', time: '12:02', type: 'received' },
  ],
};

/* ── Mapear áreas a conversationIds simulados ── */
const AREA_TO_MOCK_USER = {
  oficina: { id: 1, name: 'Sofía', role: 'advisor' },
  transporte: { id: 2, name: 'Carlos', role: 'driver' },
  tubulares: { id: 3, name: 'Miguel', role: 'operator' },
  reservas: { id: 4, name: 'Ana', role: 'advisor' },
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function ChatWidget() {
  const { t } = useTranslate();
  const { isAuthenticated, user } = useAuth();
  const { socket, isConnected, joinConversation, sendMessage, sendTyping, markAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('oficina');
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [realMessages, setRealMessages] = useState({});
  const [conversations, setConversations] = useState({});
  const [useMock, setUseMock] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* Tab configuration */
  const tabs = [
    { key: 'oficina', label: t('chat.oficina'), area: 'oficina' },
    { key: 'transporte', label: t('chat.transporte'), area: 'transporte' },
    { key: 'tubulares', label: t('chat.tubulares'), area: 'tubulares' },
    { key: 'reservas', label: t('chat.reservas'), area: 'reservas' },
  ];

  /* ── Cargar conversaciones reales al iniciar (si autenticado) ── */
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const loadConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        const convs = res.data.data || [];
        const convMap = {};
        for (const conv of convs) {
          convMap[conv.id] = conv;
        }
        setConversations(convMap);

        // Unirse a las conversaciones vía socket
        for (const conv of convs) {
          joinConversation(conv.id);
        }
      } catch {
        setUseMock(true);
      }
    };

    loadConversations();
  }, [isAuthenticated, isConnected, joinConversation]);

  /* ── Cargar mensajes reales para la conversación activa ── */
  useEffect(() => {
    if (!isAuthenticated || !isConnected || useMock) return;

    // Buscar conversación para el área activa
    const areaConv = Object.values(conversations).find(c => {
      const otherUserId = c.participant1_id === user?.id ? c.participant2_id : c.participant1_id;
      const mockUser = AREA_TO_MOCK_USER[activeTab];
      return mockUser && otherUserId === mockUser.id;
    });

    if (!areaConv) return;

    const loadMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${areaConv.id}/messages`);
        const msgs = res.data.data || [];
        setRealMessages(prev => ({
          ...prev,
          [activeTab]: msgs.map(m => ({
            id: m.id,
            sender: m.sender_name,
            avatar: { emoji: '👤', color: '#6b7280' },
            text: m.message,
            time: formatTime(m.created_at),
            type: m.sender_id === user?.id ? 'sent' : 'received',
          })),
        }));
      } catch {
        // fallback a mock
      }
    };

    loadMessages();
  }, [isAuthenticated, isConnected, activeTab, conversations, user, useMock]);

  /* ── Escuchar eventos del socket ── */
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data) => {
      const areaConv = Object.values(conversations).find(c => c.id === data.conversationId);
      const area = areaConv ? Object.entries(AREA_TO_MOCK_USER).find(
        ([_, u]) => u.id === (data.senderId === user?.id ? null : data.senderId)
      )?.[0] : null;

      const targetArea = area || activeTab;

      setRealMessages(prev => {
        const current = prev[targetArea] || [];
        // Evitar duplicados
        if (current.some(m => m.id === data.id)) return prev;
        return {
          ...prev,
          [targetArea]: [...current, {
            id: data.id,
            sender: data.senderName,
            avatar: { emoji: '👤', color: '#6b7280' },
            text: data.message,
            time: formatTime(data.createdAt),
            type: data.senderId === user?.id ? 'sent' : 'received',
          }],
        };
      });
    };

    const handleTyping = (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.userName }));
      } else {
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[data.userId];
          return next;
        });
      }
    };

    const handleRead = (data) => {
      // Opcional: actualizar estado de lectura en UI
    };

    const handleError = (data) => {
      console.error('Chat error:', data.message);
    };

    socket.on('chat:newMessage', handleNewMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:read', handleRead);
    socket.on('chat:error', handleError);

    return () => {
      socket.off('chat:newMessage', handleNewMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:read', handleRead);
      socket.off('chat:error', handleError);
    };
  }, [socket, isConnected, conversations, user, activeTab]);

  /* ── Get current messages ── */
  const currentMessages = useMock
    ? (MOCK_MESSAGES[activeTab] || [])
    : (realMessages[activeTab] || []);

  /* ── Typing indicator for current area ── */
  const isOtherTyping = useMemo(() => {
    if (useMock) return false;
    return Object.values(typingUsers).length > 0;
  }, [typingUsers, useMock]);

  /* ── Open/close handlers ── */
  const openChat = useCallback(() => {
    setIsOpen(true);
    setClosing(false);
  }, []);

  const closeChat = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 250);
  }, []);

  const handleToggle = useCallback(() => {
    if (isOpen) closeChat();
    else openChat();
  }, [isOpen, openChat, closeChat]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [activeTab, currentMessages, isOtherTyping]);

  /* ── Focus input ── */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, activeTab]);

  /* ── Lock body scroll on mobile ── */
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('chatOpen');
    } else {
      document.body.classList.remove('chatOpen');
    }
    return () => document.body.classList.remove('chatOpen');
  }, [isOpen]);

  /* ── Send message ── */
  const handleSend = useCallback(() => {
    if (!inputMessage.trim()) return;

    if (!useMock && isConnected && isAuthenticated) {
      // Buscar o crear conversación
      const areaConv = Object.values(conversations).find(c => {
        const otherUserId = c.participant1_id === user?.id ? c.participant2_id : c.participant1_id;
        const mockUser = AREA_TO_MOCK_USER[activeTab];
        return mockUser && otherUserId === mockUser.id;
      });

      if (areaConv) {
        sendMessage({
          conversationId: areaConv.id,
          message: inputMessage.trim(),
          messageType: 'text',
        });
      } else {
        // Crear conversación vía área (el backend buscará o creará)
        sendMessage({
          area: activeTab,
          message: inputMessage.trim(),
          messageType: 'text',
        });
      }
    } else {
      // Modo mock: simular respuesta
      setTimeout(() => {
        const mockUser = AREA_TO_MOCK_USER[activeTab];
        if (mockUser) {
          const newMsg = {
            id: Date.now(),
            sender: mockUser.name,
            avatar: AVATARS[Object.keys(AVATARS).find(k => AVATARS[k].emoji === mockUser.name?.[0])] || { emoji: '👤', color: '#6b7280' },
            text: getMockReply(activeTab),
            time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
            type: 'received',
          };
          // Add to mock data
          MOCK_MESSAGES[activeTab] = [...(MOCK_MESSAGES[activeTab] || []), newMsg];
          setRealMessages(prev => ({ ...prev })); // force re-render
        }
      }, 1500);
    }

    // Agregar mensaje enviado localmente
    if (!useMock) {
      setRealMessages(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), {
          id: Date.now(),
          sender: user?.name || 'Tú',
          avatar: { emoji: '👤', color: '#6b7280' },
          text: inputMessage.trim(),
          time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          type: 'sent',
        }],
      }));
    }

    setInputMessage('');
  }, [inputMessage, useMock, isConnected, isAuthenticated, activeTab, conversations, user, sendMessage]);

  /* ── Typing indicator ── */
  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);

    if (!useMock && isConnected && isAuthenticated && !typingTimeoutRef.current) {
      const areaConv = Object.values(conversations).find(c => {
        const otherUserId = c.participant1_id === user?.id ? c.participant2_id : c.participant1_id;
        const mockUser = AREA_TO_MOCK_USER[activeTab];
        return mockUser && otherUserId === mockUser.id;
      });

      if (areaConv) {
        sendTyping({ conversationId: areaConv.id, isTyping: true });
      }
    }

    // Clear typing after 2 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (!useMock && isConnected && isAuthenticated) {
        const areaConv = Object.values(conversations).find(c => {
          const otherUserId = c.participant1_id === user?.id ? c.participant2_id : c.participant1_id;
          const mockUser = AREA_TO_MOCK_USER[activeTab];
          return mockUser && otherUserId === mockUser.id;
        });
        if (areaConv) {
          sendTyping({ conversationId: areaConv.id, isTyping: false });
        }
      }
      typingTimeoutRef.current = null;
    }, 2000);
  }, [useMock, isConnected, isAuthenticated, activeTab, conversations, user, sendTyping]);

  /* ── Handle Enter ── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  /* ── Render ── */
  return (
    <>
      {!isOpen && (
        <button
          className={styles.fab}
          onClick={handleToggle}
          aria-label={t('chat.title')}
          title={t('chat.title')}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          className={`${styles.window} ${closing ? styles.windowClosing : ''}`}
          role="dialog"
          aria-label={t('chat.title')}
        >
          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.headerAvatar}>✦</div>
            <div className={styles.headerInfo}>
              <div className={styles.headerTitle}>{t('chat.title')}</div>
              <div className={styles.headerStatus}>
                <span className={`${styles.statusDot} ${isConnected ? styles.statusDotOnline : styles.statusDotOffline}`} />
                {isConnected
                  ? t('chat.en_linea')
                  : useMock
                    ? t('chat.en_linea')
                    : t('chat.fuera_linea')}
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={closeChat}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* ── Conexión perdida banner ── */}
          {!isConnected && !useMock && (
            <div className={styles.offlineBanner}>
              {t('chat.sin_conexion')}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className={styles.tabs} role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Messages ── */}
          <div className={styles.messages} ref={messagesRef}>
            {(currentMessages.length === 0 && !isOtherTyping) ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💬</div>
                <span>{t('chat.nuevo')}</span>
              </div>
            ) : (
              <>
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${
                      msg.type === 'sent' ? styles.messageSent : styles.messageReceived
                    }`}
                  >
                    {msg.type !== 'sent' && (
                      <div
                        className={styles.messageAvatar}
                        style={{ background: msg.avatar?.color || '#6b7280' }}
                      >
                        {msg.avatar?.emoji || '👤'}
                      </div>
                    )}
                    <div className={styles.messageBubble}>
                      {msg.type !== 'sent' && (
                        <div className={styles.messageName}>{msg.sender}</div>
                      )}
                      <div>{msg.text}</div>
                      <div className={styles.messageTime}>{msg.time}</div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isOtherTyping && (
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                    {Object.values(typingUsers).join(', ')} {t('chat.escribiendo')}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Input ── */}
          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!inputMessage.trim()}
              aria-label="Enviar"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Mock replies ── */
function getMockReply(area) {
  const replies = {
    oficina: [
      'Gracias por tu mensaje. Un asesor te atenderá en breve.',
      'Hemos recibido tu consulta. Te responderemos pronto.',
      'Excelente pregunta. Déjame consultar esa información.',
    ],
    transporte: [
      'El transporte está incluido en todos nuestros paquetes.',
      'Los horarios de salida se coordinan según tu reserva.',
      'Sí, tenemos servicio de recojo desde tu hotel.',
    ],
    tubulares: [
      '¡Buena elección! Es nuestra experiencia más popular.',
      'Las dunas están en excelentes condiciones hoy.',
      'La actividad es completamente segura con instructores certificados.',
    ],
    reservas: [
      'Para reservar solo necesitas elegir fecha y hora.',
      'Puedes pagar con Yape, Plin o tarjeta.',
      'Tu reserva queda confirmada al instante.',
    ],
  };
  const list = replies[area] || replies.oficina;
  return list[Math.floor(Math.random() * list.length)];
}
