import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Limpiar si no hay sesión
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Crear conexión Socket.IO — usar polling para compatibilidad con Cloudflare Tunnel
    const newSocket = io('/', {
      auth: { token },
      transports: ['polling'], // polling funciona con Cloudflare Tunnel
      upgrade: false,          // no intentar WebSocket upgrade
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Socket.IO conectado');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO desconectado:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.IO:', error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Intento de reconexión #${attempt}`);
    });

    newSocket.on('reconnect', () => {
      console.log('Socket.IO reconectado');
      setIsConnected(true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:join', conversationId);
    }
  }, []);

  const sendMessage = useCallback((data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:message', data);
    }
  }, []);

  const sendTyping = useCallback((data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:typing', data);
    }
  }, []);

  const markAsRead = useCallback((data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:read', data);
    }
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      emit,
      joinConversation,
      sendMessage,
      sendTyping,
      markAsRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
