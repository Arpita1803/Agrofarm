import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyChats } from '../../services/chatApi';

function DealerChats() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMyChats();
        setChats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load dealer chats:', error);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((chat) => {
      const last = chat?.lastMessageText || chat?.messages?.[chat.messages.length - 1]?.text || '';
      return (
        String(chat?.farmerName || 'Farmer').toLowerCase().includes(q) ||
        String(chat?.product || '').toLowerCase().includes(q) ||
        String(last).toLowerCase().includes(q)
      );
    });
  }, [chats, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dealer/dashboard')}
                className="mr-4 text-gray-600 hover:text-green-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <p className="text-gray-600">Loading chats...</p>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No chats yet</h2>
            <p className="text-gray-600">Open an order/request and start conversation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <button
                key={chat._id}
                onClick={() =>
                  navigate(`/chat/${chat._id}`, {
                    state: {
                      chatId: chat._id,
                      request: {
                        product: chat?.product || 'Product',
                        farmer: chat?.farmerName || 'Farmer',
                        image: chat?.productImage || '🌾',
                        farmerId: chat?.farmerId,
                      },
                      chatContext: {
                        requestId: chat?.requestId,
                        orderId: chat?.orderId,
                        otherUserId: chat?.farmerId,
                      },
                    },
                  })
                }
                className="w-full text-left bg-white rounded-xl border hover:border-green-300 hover:shadow-sm p-4 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{chat?.farmerName || 'Farmer'}</h3>
                    <p className="text-sm text-gray-600">Product: {chat?.product || 'N/A'}</p>
                    <p className="text-sm text-gray-700 mt-1">{chat?.lastMessageText || 'No messages yet'}</p>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(chat?.lastMessageAt || chat?.updatedAt).toLocaleString('en-IN')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DealerChats;