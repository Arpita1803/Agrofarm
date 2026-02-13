import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyChats } from '../../services/chatApi';

function FarmerChats() {
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
        console.error('Failed to load chats:', error);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
    const timer = setInterval(loadChats, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chats;

    return chats.filter((chat) => {
      const lastMessage = chat?.lastMessageText || chat?.messages?.[chat.messages.length - 1]?.text || '';
      return (
        String(chat?.dealerName || 'Dealer').toLowerCase().includes(q) ||
        String(chat?.product || '').toLowerCase().includes(q) ||
        String(lastMessage).toLowerCase().includes(q)
      );
    });
  }, [chats, searchQuery]);

  const formatTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat._id}`, {
      state: {
        chatId: chat._id,
        request: {
          product: chat?.product || 'Product',
          dealer: chat?.dealerName || 'Dealer',
          image: chat?.productImage || '🌾',
          dealerId: chat?.dealerId,
        },
        chatContext: {
          requestId: chat?.requestId,
          orderId: chat?.orderId,
          otherUserId: chat?.dealerId,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <p className="text-gray-600">Loading chats...</p>
        ) : filteredChats.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-600">No chats found.</div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className="w-full text-left bg-white rounded-xl border hover:border-green-300 hover:shadow-sm p-4 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{chat?.dealerName || 'Dealer'}</h3>
                    <p className="text-sm text-gray-600">Product: {chat?.product || 'N/A'}</p>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-1">{chat?.lastMessageText || 'No messages yet'}</p>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(chat?.lastMessageAt || chat?.updatedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmerChats;




// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { fetchMyChats } from '../../services/chatApi';

// function FarmerChats() {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [chats, setChats] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadChats = async () => {
//       try {
//         setIsLoading(true);
//         const data = await fetchMyChats();
//         setChats(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error('Failed to load chats:', error);
//         setChats([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadChats();
//   }, []);

//   const filteredChats = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     if (!q) return chats;

//     return chats.filter((chat) => {
//       const lastMessage = chat?.lastMessageText || chat?.messages?.[chat.messages.length - 1]?.text || '';
//       return (
//         String(chat?.dealerName || 'Dealer').toLowerCase().includes(q) ||
//         String(chat?.product || '').toLowerCase().includes(q) ||
//         String(lastMessage).toLowerCase().includes(q)
//       );
//     });
//   }, [chats, searchQuery]);

//   const formatTime = (value) => {
//     if (!value) return '';
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return '';
//     return date.toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const handleChatClick = (chat) => {
//     navigate(`/chat/${chat._id}`, {
//       state: {
//         chatId: chat._id,
//         request: {
//           product: chat?.product || 'Product',
//           dealer: chat?.dealerName || 'Dealer',
//           image: chat?.productImage || '🌾',
//           dealerId: chat?.dealerId,
//         },
//         chatContext: {
//           requestId: chat?.requestId,
//           orderId: chat?.orderId,
//           otherUserId: chat?.dealerId,
//         },
//       },
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center">
//               <button
//                 onClick={() => navigate('/farmer/dashboard')}
//                 className="mr-4 text-gray-600 hover:text-green-600 transition duration-300"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                 </svg>
//               </button>
//               <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
//             </div>

//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search chats..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               />
//               <div className="absolute left-3 top-2.5 text-gray-400">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {isLoading ? (
//           <p className="text-gray-600">Loading chats...</p>
//         ) : filteredChats.length === 0 ? (
//           <div className="bg-white rounded-xl border p-8 text-center text-gray-600">No chats found.</div>
//         ) : (
//           <div className="space-y-3">
//             {filteredChats.map((chat) => (
//               <button
//                 key={chat._id}
//                 onClick={() => handleChatClick(chat)}
//                 className="w-full text-left bg-white rounded-xl border hover:border-green-300 hover:shadow-sm p-4 transition"
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <h3 className="font-semibold text-gray-900">{chat?.dealerName || 'Dealer'}</h3>
//                     <p className="text-sm text-gray-600">Product: {chat?.product || 'N/A'}</p>
//                     <p className="text-sm text-gray-700 mt-1 line-clamp-1">{chat?.lastMessageText || 'No messages yet'}</p>
//                   </div>
//                   <span className="text-xs text-gray-500">{formatTime(chat?.lastMessageAt || chat?.updatedAt)}</span>
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// export default FarmerChats;
