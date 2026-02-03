 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock chat list data
const mockChats = [
  {
    id: '1',
    dealerName: 'Rajesh Traders',
    product: 'Tomato',
    lastMessage: 'I can supply 50kg at ₹12/kg',
    lastMessageTime: '10:35 AM',
    unreadCount: 2,
    dealerAvatar: 'D',
    productImage: '🍅',
    language: 'en',
    status: 'active'
  },
  {
    id: '2',
    dealerName: 'Meena Fruits',
    product: 'Orange',
    lastMessage: 'What about quality certification?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    dealerAvatar: 'M',
    productImage: '🍊',
    language: 'hi',
    status: 'active'
  },
  {
    id: '3',
    dealerName: 'Green Veggies',
    product: 'Broccoli',
    lastMessage: 'Deal finalized!',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    dealerAvatar: 'G',
    productImage: '🥦',
    language: 'en',
    status: 'completed'
  },
  {
    id: '4',
    dealerName: 'Spud Distributors',
    product: 'Potato',
    lastMessage: 'Can you deliver by Monday?',
    lastMessageTime: '3 days ago',
    unreadCount: 1,
    dealerAvatar: 'S',
    productImage: '🥔',
    language: 'mr',
    status: 'active'
  }
];

const languageMap = {
  'en': { name: 'English', flag: '🇺🇸' },
  'hi': { name: 'Hindi', flag: '🇮🇳' },
  'pa': { name: 'Punjabi', flag: '🇮🇳' },
  'mr': { name: 'Marathi', flag: '🇮🇳' },
  'ta': { name: 'Tamil', flag: '🇮🇳' },
  'te': { name: 'Telugu', flag: '🇮🇳' },
  'bn': { name: 'Bengali', flag: '🇮🇳' },
  'gu': { name: 'Gujarati', flag: '🇮🇳' }
};

function FarmerChats() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredChats = mockChats.filter(chat => {
    const matchesSearch = chat.dealerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || chat.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat.id}`, {
      state: {
        request: {
          product: chat.product,
          dealer: chat.dealerName,
          image: chat.productImage
        },
        userLanguage: chat.language
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/farmer/dashboard')}
                className="mr-4 text-gray-600 hover:text-green-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Chats
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 whitespace-nowrap ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 whitespace-nowrap ${
              filterStatus === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className="bg-white rounded-xl shadow-sm border border-green-100 p-4 hover:shadow-md transition duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Left Side - Chat Info */}
                <div className="flex items-center space-x-4">
                  {/* Dealer Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {chat.dealerAvatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-green-200 flex items-center justify-center">
                      <span className="text-xs">{chat.productImage}</span>
                    </div>
                  </div>
                  
                  {/* Chat Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900 truncate">{chat.dealerName}</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        {languageMap[chat.language]?.flag} {languageMap[chat.language]?.name}
                      </span>
                      {chat.status === 'completed' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{chat.product}</p>
                    <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                  </div>
                </div>

                {/* Right Side - Time & Unread */}
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                  {chat.unreadCount > 0 && (
                    <div className="mt-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredChats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === 'all' ? 'No chats yet' : `No ${filterStatus} chats`}
            </h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? 'Start chatting with dealers from available requests' 
                : 'No chats match this filter'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmerChats;