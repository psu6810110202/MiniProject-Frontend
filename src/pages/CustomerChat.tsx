import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isStaff: boolean;
}

interface ChatRoom {
  id: string;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  messages: ChatMessage[];
  status: 'active' | 'waiting' | 'closed';
  createdAt: string;
}

interface CustomerChatProps {
  isPopup?: boolean;
  onClose?: () => void;
}

const CustomerChat: React.FC<CustomerChatProps> = ({ isPopup = false, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock connection to staff
    const timer = setTimeout(() => {
      setIsConnected(true);
      const mockChat: ChatRoom = {
        id: '1',
        customerId: user?.id || 'cust1',
        customerName: user?.name || 'Customer',
        staffId: '2',
        staffName: 'John Support',
        messages: [
          {
            id: '1',
            senderId: '2',
            senderName: 'John Support',
            message: t('welcome_message'),
            timestamp: new Date().toISOString(),
            isStaff: true
          },
        ],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setChatRoom(mockChat);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, t]);

  useEffect(() => {
    scrollToBottom();
  }, [chatRoom?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !chatRoom) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'customer',
      senderName: user?.name || 'Customer',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isStaff: false
    };

    const updatedChat = {
      ...chatRoom,
      messages: [...chatRoom.messages, newMessage]
    };

    setChatRoom(updatedChat);
    setMessage('');

    // Simulate staff response
    setTimeout(() => {
      const staffResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: chatRoom.staffId,
        senderName: chatRoom.staffName,
        message: t('staff_typing_response'),
        timestamp: new Date().toISOString(),
        isStaff: true
      };

      setChatRoom(prev => prev ? {
        ...prev,
        messages: [...prev.messages, staffResponse]
      } : null);
    }, 1000 + Math.random() * 2000);
  };

  return (
    <div style={{
      padding: isPopup ? '0' : '20px',
      minHeight: isPopup ? 'auto' : '100vh',
      height: isPopup ? '100%' : 'auto',
      background: isPopup ? '#1a1a1a' : 'linear-gradient(to bottom, #121212, #1f1f1f)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', height: isPopup ? '100%' : 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          background: '#252525',
          borderRadius: isPopup ? '0 0 0 0' : '12px 12px 0 0',
          padding: '15px 20px',
          border: '1px solid #333',
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: isPopup ? '1.2rem' : '1.5rem' }}>
              {t('live_chat_support')}
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '0.8rem' }}>
              {chatRoom ? `${t('chatting_with')} ${chatRoom.staffName}` : t('connecting_to_staff')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isPopup && onClose && (
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            )}
            {!isPopup && (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: isConnected ? '#4CAF50' : '#FF9800',
                  animation: isConnected ? 'pulse 2s infinite' : 'none'
                }} />
                <span style={{ color: isConnected ? '#4CAF50' : '#FF9800', fontSize: '0.9rem' }}>
                  {isConnected ? t('online') : t('connecting')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          border: '1px solid #333',
          borderTop: 'none',
          borderBottom: 'none',
          flex: 1,
          overflowY: 'auto'
        }}>
          {!isConnected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#aaa'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                <p>{t('finding_available_staff')}</p>
              </div>
            </div>
          )}

          {isConnected && chatRoom && (
            <div>
              {chatRoom.messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.isStaff ? 'flex-start' : 'flex-end',
                    marginBottom: '15px'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '18px',
                    background: msg.isStaff ? '#333' : '#FF5722',
                    color: '#fff',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {!msg.isStaff && (
                      <div style={{ fontSize: '0.75rem', color: '#FFB74D', marginBottom: '3px' }}>
                        {t('you')}
                      </div>
                    )}
                    {msg.isStaff && (
                      <div style={{ fontSize: '0.75rem', color: '#4CAF50', marginBottom: '3px' }}>
                        {msg.senderName}
                      </div>
                    )}
                    <div style={{ marginBottom: '3px', fontSize: '0.95rem' }}>{msg.message}</div>
                    <div style={{ fontSize: '0.65rem', color: '#ccc', textAlign: 'right' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          background: '#252525',
          borderRadius: isPopup ? '0 0 0 0' : '0 0 12px 12px',
          padding: '15px',
          border: '1px solid #333',
          borderTop: 'none',
          flexShrink: 0
        }}>
          {chatRoom?.status === 'closed' ? (
            <div style={{ textAlign: 'center', color: '#aaa' }}>
              <p>{t('chat_ended')}</p>
              <button
                onClick={() => {
                  if (isPopup && onClose) onClose();
                  else navigate('/call-center');
                }}
                style={{
                  padding: '10px 20px',
                  background: '#FF5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {t('close')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('type_message')}
                disabled={!isConnected}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '20px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!isConnected || !message.trim()}
                style={{
                  padding: '10px 15px',
                  background: isConnected && message.trim() ? '#FF5722' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  cursor: isConnected && message.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s'
                }}
              >
                {t('send')}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CustomerChat;
