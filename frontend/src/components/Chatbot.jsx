import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setChatOpen } from '../store/authSlice';
import { LanguageContext } from '../context/LanguageContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { getChatHistory, getChatDetails, sendChatMessage, deleteChatSession } from '../utils/api';
import './Chatbot.css';

const Chatbot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  const { formatPrice } = useContext(CurrencyContext);
  
  // Select state from Redux
  const isChatOpen = useSelector((state) => state.auth.isChatOpen);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated || !!localStorage.getItem('token'));
  
  // Component local states
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Translations object
  const t = {
    EN: {
      title: "ClearPath AI Assistant",
      subtitle: "Ask about trips, destinations, or guidelines",
      placeholder: "Type your message...",
      send: "Send",
      newChat: "New Chat",
      history: "Chat History",
      noHistory: "No chat history yet.",
      deleteChat: "Delete Chat",
      loginRequired: "Authentication Required",
      loginPrompt: "Please login to chat with our AI travel planner.",
      loginBtn: "Go to Login",
      close: "Close",
      errorSend: "Failed to send message. Please try again.",
      errorLoad: "Failed to load chat details.",
      welcome: "Hi! I am your ClearPath assistant. How can I help you explore Egypt today?",
    },
    AR: {
      title: "مساعد ClearPath الذكي",
      subtitle: "اسأل عن الرحلات، الوجهات، أو بروتوكول الإقامة",
      placeholder: "اكتب رسالتك هنا...",
      send: "إرسال",
      newChat: "محادثة جديدة",
      history: "سجل المحادثات",
      noHistory: "لا يوجد سجل محادثات بعد.",
      deleteChat: "حذف المحادثة",
      loginRequired: "مطلوب تسجيل الدخول",
      loginPrompt: "يرجى تسجيل الدخول للدردشة مع مخطط الرحلات الذكي.",
      loginBtn: "تسجيل الدخول",
      close: "إغلاق",
      errorSend: "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      errorLoad: "فشل تحميل تفاصيل المحادثة.",
      welcome: "مرحباً بك! أنا مساعد ClearPath الخاص بك. كيف يمكنني مساعدتك في استكشاف مصر اليوم؟",
    }
  };

  const currentT = t[lang] || t.EN;

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger scroll on message update
  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // Load chat history on mount & when authenticated changes or when chat is opened
  useEffect(() => {
    if (isAuthenticated && isChatOpen) {
      fetchHistory();
    }
  }, [isAuthenticated, isChatOpen]);

  // Load welcome message if no session active
  useEffect(() => {
    if (!chatId && messages.length === 0) {
      setMessages([
        {
          sender: 'bot',
          content: currentT.welcome,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [chatId, lang]);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await getChatHistory();
      if (res && res.success) {
        setHistory(res.data || []);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSelectSession = async (id) => {
    setIsLoading(true);
    try {
      const res = await getChatDetails(id);
      if (res && res.success) {
        setChatId(id);
        const mappedMessages = res.data.messages.map(msg => ({
          sender: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content,
          packages: msg.packages || [],
          timestamp: msg.timestamp || new Date().toISOString()
        }));
        setMessages(mappedMessages);
        setShowHistory(false);
      }
    } catch (err) {
      alert(currentT.errorLoad);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setChatId(null);
    setMessages([
      {
        sender: 'bot',
        content: currentT.welcome,
        timestamp: new Date().toISOString()
      }
    ]);
    setShowHistory(false);
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(lang === 'AR' ? "هل أنت متأكد من حذف هذه المحادثة؟" : "Are you sure you want to delete this chat session?")) {
      try {
        const res = await deleteChatSession(id);
        if (res && res.success) {
          fetchHistory();
          if (chatId === id) {
            handleStartNewChat();
          }
        }
      } catch (err) {
        console.error("Error deleting session:", err);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      sender: 'user',
      content: inputMessage,
      packages: [],
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await sendChatMessage(messageToSend, chatId);
      if (res && res.success) {
        setChatId(res.data.chatId);
        const serverMessages = res.data.messages || [];
        const lastServerMsg = serverMessages[serverMessages.length - 1];
        const botMsg = {
          sender: 'bot',
          content: res.data.reply,
          packages: lastServerMsg?.packages || [],
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
        fetchHistory(); // Refresh history with latest titles
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          content: currentT.errorSend,
          isError: true,
          packages: [],
          timestamp: new Date().toISOString()
        }
      ]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = () => {
    dispatch(setChatOpen(false));
  };

  const handleRedirectLogin = () => {
    dispatch(setChatOpen(false));
    navigate('/login');
  };

  if (!isChatOpen) return null;

  return (
    <div className={`chatbot-overlay-container ${lang === 'AR' ? 'rtl-layout' : 'ltr-layout'}`}>
      <div className="chatbot-window card">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <div className="bot-avatar">
              <i className="fa-solid fa-robot"></i>
              <span className="online-indicator"></span>
            </div>
            <div className="header-text">
              <h4>{currentT.title}</h4>
              <p>{currentT.subtitle}</p>
            </div>
          </div>
          <div className="header-actions">
            {isAuthenticated && (
              <>
                <button 
                  className={`btn-header-action ${showHistory ? 'active' : ''}`}
                  onClick={() => setShowHistory(!showHistory)}
                  title={currentT.history}
                >
                  <i className="fa-solid fa-history"></i>
                </button>
                <button 
                  className="btn-header-action" 
                  onClick={handleStartNewChat}
                  title={currentT.newChat}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </>
            )}
            <button className="btn-header-close" onClick={handleCloseChat} title={currentT.close}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Chatbot Content Area */}
        <div className="chatbot-body-container">
          {/* History Collapsible Panel */}
          {showHistory && isAuthenticated && (
            <div className="history-panel">
              <div className="history-header">
                <h5>{currentT.history}</h5>
                <button className="btn-close-history" onClick={() => setShowHistory(false)}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              </div>
              <div className="history-list">
                {isHistoryLoading ? (
                  <div className="history-loader">
                    <span className="spinner-mini"></span>
                  </div>
                ) : history.length === 0 ? (
                  <p className="no-history-text">{currentT.noHistory}</p>
                ) : (
                  history.map((session) => (
                    <div 
                      key={session._id} 
                      className={`history-item ${chatId === session._id ? 'active' : ''}`}
                      onClick={() => handleSelectSession(session._id)}
                    >
                      <i className="fa-regular fa-comment"></i>
                      <span className="session-title" title={session.title || "Chat session"}>
                        {session.title || "Chat session"}
                      </span>
                      <button 
                        className="btn-delete-session" 
                        onClick={(e) => handleDeleteSession(session._id, e)}
                        title={currentT.deleteChat}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat Messages / Unauthenticated Prompt */}
          {!isAuthenticated ? (
            <div className="unauth-container">
              <div className="unauth-graphic">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h4>{currentT.loginRequired}</h4>
              <p>{currentT.loginPrompt}</p>
              <button className="btn-unauth-login" onClick={handleRedirectLogin}>
                {currentT.loginBtn}
              </button>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble-wrapper ${msg.sender}`}>
                  <div className="message-bubble-group" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
                    <div className={`message-bubble ${msg.isError ? 'error-bubble' : ''}`}>
                      <p className="message-content">{msg.content}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Render matching package cards directly below the bot's text bubble */}
                    {msg.sender === 'bot' && msg.packages && msg.packages.length > 0 && (
                      <div className="chatbot-packages-list">
                        {msg.packages.map((pkg) => (
                          <div key={pkg._id} className="chatbot-package-card">
                            {pkg.image && (
                              <img 
                                src={pkg.image} 
                                alt={pkg.name} 
                                className="chatbot-package-img" 
                              />
                            )}
                            <div className="chatbot-package-info">
                              <h5 className="chatbot-package-title">{pkg.name}</h5>
                              <div className="chatbot-package-meta">
                                <span className="chatbot-package-duration">
                                  <i className="fa-regular fa-clock"></i> {pkg.duration_days} {lang === 'AR' ? 'أيام' : 'days'}
                                </span>
                                <span className="chatbot-package-price">
                                  {formatPrice(pkg.base_price)}
                                </span>
                              </div>
                              <div className="chatbot-package-actions">
                                <button 
                                  className="btn-chatbot-pkg-view"
                                  onClick={() => {
                                    dispatch(setChatOpen(false));
                                    navigate(`/package-details/${pkg._id}`);
                                  }}
                                >
                                  {lang === 'AR' ? 'تفاصيل' : 'Details'}
                                </button>
                                <button 
                                  className="btn-chatbot-pkg-book"
                                  onClick={() => {
                                    dispatch(setChatOpen(false));
                                    navigate(`/package-details/${pkg._id}?bookDirectly=true`);
                                  }}
                                >
                                  {lang === 'AR' ? 'احجز الآن' : 'Book Now'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message-bubble-wrapper bot">
                  <div className="message-bubble typing-indicator-bubble">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form Area */}
        {isAuthenticated && (
          <form className="chatbot-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={currentT.placeholder}
              disabled={isLoading}
              required
            />
            <button type="submit" className="btn-send-message" disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? <span className="spinner-mini"></span> : <i className="fa-solid fa-paper-plane"></i>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
