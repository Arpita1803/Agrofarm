import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ProceedDealForm from '../components/chat/ProceedDealForm';
import { createOrGetChat, fetchChatMessages, sendChatMessage } from '../services/chatApi';

const languageMap = {
  en: { name: 'English', flag: '🇺🇸' },
  hi: { name: 'Hindi', flag: '🇮🇳' },
  pa: { name: 'Punjabi', flag: '🇮🇳' },
  mr: { name: 'Marathi', flag: '🇮🇳' },
  ta: { name: 'Tamil', flag: '🇮🇳' },
  te: { name: 'Telugu', flag: '🇮🇳' },
  bn: { name: 'Bengali', flag: '🇮🇳' },
  gu: { name: 'Gujarati', flag: '🇮🇳' },
};

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

const decodeTokenPayload = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    const payload = token.split('.')[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

function ChatInterface() {
  const { chatId: routeChatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const { request, userLanguage = 'en', chatContext = {} } = location.state || {};

  const role = localStorage.getItem('role') || decodeTokenPayload()?.role || 'farmer';
  const tokenPayload = useMemo(() => decodeTokenPayload(), []);
  const currentUserId = tokenPayload?.id || tokenPayload?.userId || tokenPayload?._id;

  const [chatId, setChatId] = useState(isObjectId(routeChatId) ? routeChatId : null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showProceedDeal, setShowProceedDeal] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');

  const otherUserLabel = role === 'dealer' ? request?.farmer || 'Farmer' : request?.dealer || 'Dealer';
  const otherUserLanguage = userLanguage === 'en' ? 'hi' : 'en';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const bootstrapChat = async () => {
      try {
        setIsBootstrapping(true);

        setBootstrapError('');

        if (isObjectId(routeChatId)) {
          setChatId(routeChatId);
          return;
        }

        if (isObjectId(location.state?.chatId)) {
          setChatId(location.state.chatId);
          return;
        }

        const otherUserId =
          chatContext?.otherUserId ||
          request?.dealerId ||
          request?.farmerId;

        const payload = {
          otherUserId,
          requestId: chatContext?.requestId || request?._id,
          orderId: chatContext?.orderId,
        };

        if (!payload.otherUserId || (!payload.requestId && !payload.orderId)) {
          setBootstrapError('Unable to initialize chat. Please open chat from request/order card.');
          return;
        }

        const chat = await createOrGetChat(payload);
        if (chat?._id) {
          setChatId(chat._id);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setBootstrapError(error?.response?.data?.message || 'Failed to initialize chat');
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapChat();
  }, [routeChatId, location.state, chatContext, request]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;
      try {
        const data = await fetchChatMessages(chatId);
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      setIsLoading(true);
      const created = await sendChatMessage(chatId, newMessage.trim());
      setMessages((prev) => [...prev, created]);
      setNewMessage('');
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDealSubmit = (dealData) => {
    console.log('Deal submitted:', dealData);
    setShowProceedDeal(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const messageSender = (msg) => {
    if (msg?.senderRole) return msg.senderRole;
    if (msg?.senderId && currentUserId) {
      return String(msg.senderId) === String(currentUserId) ? role : role === 'farmer' ? 'dealer' : 'farmer';
    }
    return 'dealer';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(role === 'dealer' ? '/dealer/chats' : '/farmer/chats')}
                className="text-gray-600 hover:text-green-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <div>
                <h1 className="text-lg font-bold text-gray-900">{otherUserLabel}</h1>
                <div className="text-xs text-gray-600">
                  <span className="mr-2">{languageMap[userLanguage]?.flag} {languageMap[userLanguage]?.name}</span>
                  {showTranslation && <span>→ {languageMap[otherUserLanguage]?.flag} {languageMap[otherUserLanguage]?.name}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTranslation((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition duration-300 ${
                  showTranslation ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showTranslation ? '🌐 Translation On' : '🌐 Translation Off'}
              </button>
              <button
                onClick={() => setShowProceedDeal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-medium"
              >
                Proceed to Deal
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{request?.image || '🌾'}</span>
              <div>
                <h2 className="font-bold text-gray-900">{request?.product || 'Product Name'}</h2>
                <p className="text-sm text-gray-600">{chatId ? `Chat ID: ${chatId}` : 'Chat not initialized yet'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-100 h-[60vh] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isBootstrapping ? (
              <p className="text-gray-600">Loading chat...</p>
            ) : bootstrapError ? (
              <p className="text-red-600">{bootstrapError}</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500">No messages yet. Start the conversation.</p>
            ) : (
              messages.map((message, index) => {
                const sender = messageSender(message);
                const mine = sender === role;
                return (
                  <div key={message._id || `${message.createdAt}-${index}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 ${mine ? 'bg-green-100 text-gray-900 rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                      <p className="text-sm">{message.text}</p>
                      <div className={`text-xs text-gray-500 mt-1 ${mine ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="2"
                  disabled={isLoading || !chatId}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={isLoading || !chatId || !newMessage.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showProceedDeal && (
        <ProceedDealForm
          request={request}
          onClose={() => setShowProceedDeal(false)}
          onSubmit={handleDealSubmit}
        />
      )}
    </div>
  );
}

export default ChatInterface;
