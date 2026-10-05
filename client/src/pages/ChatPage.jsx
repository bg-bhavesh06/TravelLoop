import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
  : window.location.origin;

// Countdown hook
const useCountdown = (expiresAt) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [urgency, setUrgency] = useState('normal'); // normal, warning, critical

  useEffect(() => {
    if (!expiresAt) return;

    const update = () => {
      const now = new Date().getTime();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        setUrgency('critical');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      setIsExpired(false);

      if (hours < 1) setUrgency('critical');
      else if (hours < 6) setUrgency('warning');
      else setUrgency('normal');
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return { timeLeft, isExpired, urgency };
};

// Countdown badge component
const CountdownBadge = ({ expiresAt, compact = false }) => {
  const { timeLeft, isExpired, urgency } = useCountdown(expiresAt);

  const colors = {
    normal: { bg: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.15)', text: '#0891B2' },
    warning: { bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.15)', text: '#D97706' },
    critical: { bg: 'rgba(186, 26, 26, 0.08)', border: 'rgba(186, 26, 26, 0.15)', text: '#BA1A1A' },
  };

  const c = colors[urgency];

  if (compact) {
    return (
      <span style={{
        fontSize: '10px', fontWeight: '600', color: c.text,
        background: c.bg, border: `1px solid ${c.border}`,
        padding: '2px 8px', borderRadius: '99px',
        display: 'inline-flex', alignItems: 'center', gap: '4px',
      }}>
        <Clock style={{ width: '10px', height: '10px' }} />
        {isExpired ? 'Expired' : timeLeft}
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 14px', borderRadius: '12px',
      background: c.bg, border: `1px solid ${c.border}`,
    }}>
      <Clock style={{ width: '14px', height: '14px', color: c.text }} />
      <span style={{ fontSize: '13px', fontWeight: '600', color: c.text }}>
        {isExpired ? 'Chat Expired' : `Expires in ${timeLeft}`}
      </span>
    </div>
  );
};

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatExpired, setChatExpired] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const selectChat = useCallback(async (chat) => {
    setActiveChat(chat);
    setChatExpired(false);
    if (socketRef.current) {
      socketRef.current.emit('join_chat', chat._id);
    }
    try {
      const data = await chatService.getChat(chat._id);
      setMessages(data.messages || []);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.message?.includes('expired')) {
        setChatExpired(true);
        setMessages([]);
      } else {
        console.error('Error loading chat messages:', err);
        setMessages([]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true
    });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    chatService.getChats()
      .then(data => {
        setChats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching chats:', err);
        setLoading(false);
      });

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      selectChat(chats[0]);
    }
  }, [chats, activeChat, selectChat]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeChat) return;

    const handleReceiveMessage = (message) => {
      if (message.chatId === activeChat._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !activeChat || chatExpired) return;

    if (activeChat.expiresAt && new Date() > new Date(activeChat.expiresAt)) {
      setChatExpired(true);
      return;
    }

    socketRef.current.emit('send_message', {
      chatId: activeChat._id,
      senderId: user._id,
      content: newMessage.trim()
    });
    setNewMessage('');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '560px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <MessageSquare style={{ width: '36px', height: '36px', color: '#2563EB' }} />
        </div>
        <h2 className="font-display" style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
          No Active Chats
        </h2>
        <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
          Unlock premium chats by visiting the Community page and paying ₹20 to chat with any trip creator for 24 hours!
        </p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/community')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 28px', borderRadius: '14px', fontSize: '14px', fontWeight: '600',
            background: '#2563EB',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.20)',
          }}>
          <Sparkles style={{ width: '16px', height: '16px' }} /> Browse Community Trips
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', borderRight: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} /> Messages
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {chats.map(chat => {
            const otherUser = chat.participants?.find(p => p && p._id !== user?._id);
            const isActive = activeChat?._id === chat._id;
            return (
              <div key={chat._id} onClick={() => selectChat(chat)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '16px',
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: '4px',
                background: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(37, 99, 235, 0.15)' : 'transparent'}`
              }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                  {otherUser?.firstName?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4 style={{ color: '#111827', fontSize: '14px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {otherUser?.firstName || 'User'} {otherUser?.lastName || ''}
                  </h4>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: '3px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.tripId?.title || 'Unknown Trip'}
                  </p>
                  <CountdownBadge expiresAt={chat.expiresAt} compact />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FAFBFC' }}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                  {activeChat.participants?.find(p => p && p._id !== user?._id)?.firstName?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 style={{ color: '#111827', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    {activeChat.participants?.find(p => p && p._id !== user?._id)?.firstName} {activeChat.participants?.find(p => p && p._id !== user?._id)?.lastName}
                  </h3>
                  <span style={{ color: '#2563EB', fontSize: '12px', fontWeight: 600 }}>Premium Traveler Chat</span>
                </div>
              </div>
              <CountdownBadge expiresAt={activeChat.expiresAt} />
            </div>

            {/* Expired Overlay */}
            {chatExpired && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px', textAlign: 'center'
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'rgba(186, 26, 26, 0.06)', border: '1px solid rgba(186, 26, 26, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                  <AlertTriangle style={{ width: '32px', height: '32px', color: '#BA1A1A' }} />
                </div>
                <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                  Chat Expired
                </h3>
                <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', maxWidth: '360px' }}>
                  Your 24-hour chat window has ended. You can pay ₹20 again from the Community page to reopen this conversation.
                </p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/community')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                    background: '#2563EB',
                    color: 'white', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.20)',
                  }}>
                  <Sparkles style={{ width: '14px', height: '14px' }} /> Renew Access
                </motion.button>
              </div>
            )}

            {/* Messages Area */}
            {!chatExpired && (
              <>
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                      <p style={{ fontSize: '14px' }}>No messages yet. Say hello! 👋</p>
                    </div>
                  )}
                  {messages.map((msg, index) => {
                    const senderId = (msg.senderId && typeof msg.senderId === 'object') ? msg.senderId._id : msg.senderId;
                    const isMe = senderId === user?._id;
                    return (
                      <motion.div key={msg._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: isMe ? '#2563EB' : '#FFFFFF',
                          color: isMe ? 'white' : '#111827',
                          padding: '12px 18px',
                          borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                          fontSize: '14.5px',
                          lineHeight: 1.5,
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          border: isMe ? 'none' : '1px solid #E2E8F0'
                        }}>
                        {msg.content}
                        <div style={{ fontSize: '10px', color: isMe ? 'rgba(255,255,255,0.7)' : '#64748B', marginTop: '4px', textAlign: 'right' }}>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div style={{ padding: '20px', borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="input-field"
                      style={{ flex: 1, padding: '16px 20px', borderRadius: '99px', background: '#F8FAFC' }}
                    />
                    <button type="submit" disabled={!newMessage.trim()} style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: '#2563EB',
                      border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      opacity: newMessage.trim() ? 1 : 0.5,
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}>
                      <Send style={{ width: '20px', height: '20px', marginLeft: '-2px' }} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MessageSquare style={{ width: '32px', height: '32px', color: '#94A3B8' }} />
            </div>
            <h3 style={{ color: '#111827', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Your Premium Chats</h3>
            <p style={{ fontSize: '14px' }}>Select a chat from the sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
