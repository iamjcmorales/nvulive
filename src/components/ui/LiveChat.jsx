import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaTimes, FaComments, FaExclamationTriangle, FaWifi, FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateFirebaseConfig, checkNetworkConnection } from '../../utils/firebaseCheck';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f0f23;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 150, 136, 0.2);
  padding: 0;
  margin: 0;
`;

const ChatHeader = styled.div`
  background: rgb(0,150,136);
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 200, 180, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,150,136,0.15);
`;

const ChatTitle = styled.h3`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #0f0f23;
  max-height: 400px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 150, 136, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 150, 136, 0.5);
  }
`;

const Message = styled.div`
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid ${props => props.$isOwn ? 'rgb(0,150,136)' : '#666'};
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageUsername = styled.span`
  color: ${props => props.$isOwn ? 'rgb(0,200,180)' : '#a855f7'};
  font-weight: 600;
  font-size: 12px;
  margin-right: 6px;
`;

const MessageText = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  word-wrap: break-word;
`;

const MessageTime = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  margin-left: 8px;
`;

const InputContainer = styled.div`
  padding: 12px 16px 12px 16px;
  border-top: 1px solid rgba(0, 150, 136, 0.2);
  background: rgba(0, 150, 136, 0.08);
  border-radius: 0 0 7px 7px;
  margin: 0;
  position: relative;
  bottom: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 150, 136, 0.2);
  border-radius: 20px;
  padding: 8px 16px;
  color: #fff;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: rgb(0,150,136);
    box-shadow: 0 0 0 2px rgba(0, 150, 136, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, rgb(0,150,136), rgb(0,200,180));
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 150, 136, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 8px 12px;
  color: #fca5a5;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: slideIn 0.3s ease;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${props => props.$connected ? '#10b981' : '#ef4444'};
  margin-left: auto;
`;

const RetryButton = styled.button`
  background: rgba(239, 68, 68, 0.8);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  color: white;
  font-size: 11px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 1);
  }
`;


const LiveChat = ({ onClose, educatorName }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('Usuario');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const maxRetries = 3;

  // Obtener nombre del usuario del localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('nvuUserData');
    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        const userName = userData.name || userData.customerName || userData.firstName || 'Usuario';
        if (userName && userName.trim() && userName !== 'undefined' && userName !== 'null') {
          setUsername(userName.trim());
        } else {
          setUsername('Usuario');
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUsername('Usuario');
        setError('Error al cargar datos de usuario');
      }
    } else {
      setUsername('Usuario');
    }
  }, []);

  // Verificar configuración de Firebase
  useEffect(() => {
    const config = validateFirebaseConfig();
    if (!config.isValid) {
      setError(`Error de configuración: ${config.error}`);
      setIsConnected(false);
      return;
    }
    
    if (!db) {
      setError('Error de configuración: Base de datos no disponible');
      setIsConnected(false);
      return;
    }

    // Check network connectivity
    checkNetworkConnection().then(result => {
      if (!result.isConnected) {
        setError(`Error de red: ${result.error}`);
        setIsConnected(false);
      }
    });
  }, []);

  // Limpiar errores después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Configurar listener en tiempo real para mensajes de Firestore
  useEffect(() => {
    if (!educatorName) return;

    setLoading(true);
    
    // Crear query para mensajes del educador específico
    // Query simple que no requiere índice compuesto
    const messagesQuery = query(
      collection(db, 'liveChat'),
      where('educatorName', '==', educatorName),
      limit(100)
    );

    // Configurar listener en tiempo real
    unsubscribeRef.current = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = [];
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Asegurar que tenemos un timestamp válido
        let messageTimestamp;
        try {
          if (data.timestamp?.toDate) {
            messageTimestamp = data.timestamp.toDate();
          } else if (data.createdAt?.toDate) {
            messageTimestamp = data.createdAt.toDate();
          } else if (data.createdAt) {
            messageTimestamp = new Date(data.createdAt);
          } else {
            messageTimestamp = new Date();
          }
          
          // Validar que el timestamp es una fecha válida
          if (isNaN(messageTimestamp.getTime())) {
            messageTimestamp = new Date();
          }
        } catch (error) {
          console.warn('Error processing timestamp:', error);
          messageTimestamp = new Date();
        }
        
        // Filtrar mensajes de las últimas 24 horas en el cliente
        if (messageTimestamp >= twentyFourHoursAgo) {
          messagesData.push({
            id: doc.id,
            text: data.text || '',
            username: data.username || 'Usuario',
            educatorName: data.educatorName || '',
            timestamp: messageTimestamp,
            isOwn: data.username === username
          });
        }
      });
      
      // Ordenar mensajes por timestamp
      messagesData.sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(messagesData);
      setLoading(false);
      setIsConnected(true);
      setError(null);
    }, (error) => {
      console.error("❌ Error fetching messages:", error);
      setLoading(false);
      setIsConnected(false);
      setError('Error de conexión. Verificando...');
      
      // Retry connection after 3 seconds
      setTimeout(() => {
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setLoading(true);
        } else {
          setError('No se puede conectar al chat. Verifica tu conexión a internet.');
        }
      }, 3000);
    });

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [educatorName, username]);

  // Auto scroll al final del contenedor de mensajes (no de la página)
  useEffect(() => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      const messagesContainer = messagesEndRef.current.parentElement;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newMessage.trim() || !username || !educatorName) {
      setError('Faltan datos para enviar el mensaje');
      return;
    }

    if (!db) {
      setError('Error de configuración: Base de datos no disponible');
      return;
    }

    setIsSending(true);
    setError(null);
    
    try {
      // Enviar mensaje a Firestore
      await addDoc(collection(db, 'liveChat'), {
        text: newMessage.trim(),
        username: username,
        educatorName: educatorName,
        timestamp: serverTimestamp(),
        createdAt: new Date() // Fallback para ordenar si serverTimestamp falla
      });
      
      setNewMessage('');
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Specific error handling
      if (error.code === 'permission-denied') {
        setError('No tienes permisos para enviar mensajes');
      } else if (error.code === 'unavailable') {
        setError('Servicio no disponible. Reintentando...');
        // Auto retry after 2 seconds
        setTimeout(() => {
          if (retryCount < maxRetries) {
            handleSendMessage(e);
            setRetryCount(prev => prev + 1);
          }
        }, 2000);
      } else {
        setError('Error al enviar mensaje. Verifica tu conexión.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryConnection = () => {
    setError(null);
    setRetryCount(0);
    setLoading(true);
    setIsConnected(true);
  };

  const formatTime = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.warn('Error formatting time:', error);
      return '--:--';
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <div>
          <ChatTitle>
            <FaComments />
            {t('liveChat.title')}
          </ChatTitle>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ConnectionStatus $connected={isConnected}>
            <FaWifi size={10} />
            {isConnected ? t('liveChat.connected') : t('liveChat.disconnected')}
          </ConnectionStatus>
          <CloseButton onClick={onClose} title={t('liveChat.closeChat')}>
            <FaTimes />
          </CloseButton>
        </div>
      </ChatHeader>
      
      {error && (
        <ErrorMessage>
          <FaExclamationTriangle />
          {error}
          {!isConnected && (
            <RetryButton onClick={handleRetryConnection}>
              Reintentar
            </RetryButton>
          )}
        </ErrorMessage>
      )}
      
      <MessagesContainer>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            {t('liveChat.loading')}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
            textAlign: 'center',
            padding: '20px'
          }}>
            {t('liveChat.emptyChat')}
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} $isOwn={message.isOwn}>
              <MessageUsername $isOwn={message.isOwn}>
                {String(message.username || 'Usuario')}:
              </MessageUsername>
              <MessageText>{String(message.text || '')}</MessageText>
              <MessageTime>{formatTime(message.timestamp)}</MessageTime>
            </Message>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <form onSubmit={handleSendMessage}>
          <InputWrapper>
            <MessageInput
              type="text"
              placeholder={t('liveChat.messagePlaceholder', { username: username || 'Usuario' })}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={200}
            />
            <SendButton 
              type="submit" 
              disabled={!newMessage.trim() || isSending || !isConnected}
              title={isSending ? 'Enviando...' : t('liveChat.sendMessage')}
            >
              {isSending ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={12} /> : <FaPaperPlane size={12} />}
            </SendButton>
          </InputWrapper>
        </form>
      </InputContainer>
    </ChatContainer>
  );
};

export default LiveChat;