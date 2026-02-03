import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProceedDealForm from '../components/chat/ProceedDealForm';

// Mock translation function - in real app, this would call an API
const translateText = async (text, fromLang, toLang) => {
  // Mock translation - in reality this would be an API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const translations = {
    'en': { 'hi': 'हैलो', 'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'mr': 'हॅलो' },
    'hi': { 'en': 'Hello', 'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'mr': 'हॅलो' },
    'pa': { 'en': 'Hello', 'hi': 'नमस्ते', 'mr': 'हॅलो' },
    'mr': { 'en': 'Hello', 'hi': 'नमस्ते', 'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ' }
  };
  
  if (fromLang === toLang) return text;
  
  // Simple mock translation logic
  if (text.toLowerCase().includes('hello') || text.includes('हैलो') || text.includes('ਸਤ ਸ੍ਰੀ ਅਕਾਲ') || text.includes('हॅलो')) {
    return translations[fromLang]?.[toLang] || text;
  }
  
  return `[Translated from ${fromLang} to ${toLang}]: ${text}`;
};

// Mock chat messages
const initialMessages = [
  {
    id: 1,
    sender: 'farmer',
    text: 'Hello, I have fresh tomatoes available from my farm.',
    originalText: 'Hello, I have fresh tomatoes available from my farm.',
    language: 'en',
    timestamp: '2024-01-15T10:30:00Z',
    translated: false
  },
  {
    id: 2,
    sender: 'dealer',
    text: 'नमस्ते, मुझे 50 किलो टमाटर चाहिए। क्या आपका सबसे अच्छा मूल्य क्या है?',
    originalText: 'नमस्ते, मुझे 50 किलो टमाटर चाहिए। क्या आपका सबसे अच्छा मूल्य क्या है?',
    language: 'hi',
    timestamp: '2024-01-15T10:32:00Z',
    translated: false
  },
  {
    id: 3,
    sender: 'farmer',
    text: 'I can supply 50kg of fresh Roma tomatoes at ₹12 per kg, including delivery.',
    originalText: 'I can supply 50kg of fresh Roma tomatoes at ₹12 per kg, including delivery.',
    language: 'en',
    timestamp: '2024-01-15T10:35:00Z',
    translated: false
  }
];

// Language mapping
const languageMap = {
  'en': { name: 'English', native: 'English', flag: '🇺🇸' },
  'hi': { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  'pa': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  'mr': { name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  'ta': { name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  'te': { name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  'bn': { name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  'gu': { name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' }
};

function ChatInterface() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { request, userLanguage } = location.state || {};
  const [currentUser] = useState('farmer'); // In real app, this would come from auth context
  const [otherUser] = useState('dealer');
  
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showProceedDeal, setShowProceedDeal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  
  const otherUserLanguage = userLanguage === 'en' ? 'hi' : 'en'; // Mock - in real app this would come from other user's settings

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsLoading(true);

    const newMsg = {
      id: messages.length + 1,
      sender: currentUser,
      text: newMessage,
      originalText: newMessage,
      language: userLanguage,
      timestamp: new Date().toISOString(),
      translated: false,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    // Add message immediately
    setMessages(prev => [...prev, newMsg]);
    
    // Clear input and attachments
    setNewMessage('');
    setAttachments([]);

    // Simulate translation if languages differ
    if (showTranslation && userLanguage !== otherUserLanguage) {
      setTimeout(async () => {
        const translatedText = await translateText(newMessage, userLanguage, otherUserLanguage);
        
        setMessages(prev => prev.map(msg => 
          msg.id === newMsg.id 
            ? { ...msg, translatedText, translated: true }
            : msg
        ));
      }, 500);
    }

    // Simulate reply after delay
    setTimeout(async () => {
      const replies = [
        "That sounds good. Can you deliver by Monday?",
        "Can we negotiate the price to ₹11 per kg?",
        "What's the quality grade of your tomatoes?",
        "Do you have quality certification?",
        "Let me check and get back to you."
      ];
      
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      
      const replyMsg = {
        id: messages.length + 2,
        sender: otherUser,
        text: replyText,
        originalText: replyText,
        language: otherUserLanguage,
        timestamp: new Date().toISOString(),
        translated: false
      };

      setMessages(prev => [...prev, replyMsg]);

      // Translate reply if needed
      if (showTranslation && userLanguage !== otherUserLanguage) {
        setTimeout(async () => {
          const translatedText = await translateText(replyText, otherUserLanguage, userLanguage);
          
          setMessages(prev => prev.map(msg => 
            msg.id === replyMsg.id 
              ? { ...msg, translatedText, translated: true }
              : msg
          ));
        }, 500);
      }
    }, 2000);

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleProceedDeal = () => {
    setShowProceedDeal(true);
  };

  const handleDealSubmit = (dealData) => {
    console.log('Deal submitted:', dealData);
    // Here you would create an order in your backend
    setShowProceedDeal(false);
    
    // Show success message and navigate
    alert('Deal submitted successfully! The dealer will now review and accept.');
    navigate('/farmer/orders');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/farmer/dashboard')}
                className="text-gray-600 hover:text-green-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {otherUser === 'dealer' ? 'D' : 'F'}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {request?.dealer || 'Dealer Name'}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      {languageMap[userLanguage]?.flag} {languageMap[userLanguage]?.name}
                    </span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {languageMap[otherUserLanguage]?.flag} {languageMap[otherUserLanguage]?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition duration-300 ${
                  showTranslation 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showTranslation ? '🌐 Translation On' : '🌐 Translation Off'}
              </button>
              
              <button
                onClick={handleProceedDeal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-medium"
              >
                Proceed to Deal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Product Info Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{request?.image || '🍅'}</span>
              <div>
                <h2 className="font-bold text-gray-900">{request?.product || 'Product Name'}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>📦 {request?.quantity || 0} kg required</span>
                  <span>💰 ₹{request?.priceRange?.min || 0} - ₹{request?.priceRange?.max || 0}/kg</span>
                  <span>📅 Required by: {request?.requiredDate ? new Date(request.requiredDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{request?.dealer || 'Dealer Name'}</p>
              <p className="text-xs text-gray-600">📞 {request?.mobile || '+91 XXXXX XXXXX'}</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="bg-white rounded-xl shadow-sm border border-green-100 h-[60vh] overflow-hidden flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 ${
                    message.sender === currentUser
                      ? 'bg-green-100 text-gray-900 rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {/* Message Text */}
                  <div className="mb-1">
                    <p className="text-sm">{message.text}</p>
                    
                    {/* Translated Text */}
                    {showTranslation && message.translatedText && (
                      <div className="mt-2 pt-2 border-t border-gray-300 border-opacity-30">
                        <p className="text-xs text-gray-600 italic">
                          {message.translatedText}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-gray-500">
                            {languageMap[message.language]?.flag} → {languageMap[message.sender === currentUser ? otherUserLanguage : userLanguage]?.flag}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((att) => (
                          <div key={att.id} className="border border-gray-300 rounded-lg p-2">
                            {att.type === 'image' ? (
                              <img 
                                src={att.url} 
                                alt={att.name} 
                                className="max-w-full h-auto rounded"
                              />
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-500">📎</span>
                                <span className="text-xs truncate">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs text-gray-500 mt-1 ${message.sender === currentUser ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div key={att.id} className="relative border border-gray-300 rounded-lg p-2">
                    {att.type === 'image' ? (
                      <>
                        <img 
                          src={att.url} 
                          alt={att.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <button
                          onClick={() => removeAttachment(att.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>📎</span>
                        <span className="text-xs">{att.name}</span>
                        <button
                          onClick={() => removeAttachment(att.id)}
                          className="text-red-500 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-end space-x-3">
              {/* File Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:text-green-600 transition duration-300"
                title="Attach files"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                />
              </button>
              
              {/* Message Textarea */}
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="2"
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500">
                  Press Enter to send
                </div>
              </div>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!newMessage.trim() && attachments.length === 0)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send'
                )}
              </button>
            </div>
            
            {/* Language Info */}
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <div>
                Your messages are in <span className="font-medium">{languageMap[userLanguage]?.name}</span>
                {showTranslation && userLanguage !== otherUserLanguage && (
                  <span> and will be translated to {languageMap[otherUserLanguage]?.name}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span>{languageMap[userLanguage]?.flag}</span>
                {showTranslation && userLanguage !== otherUserLanguage && (
                  <>
                    <span>→</span>
                    <span>{languageMap[otherUserLanguage]?.flag}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Proceed to Deal Modal */}
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