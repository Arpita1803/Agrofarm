import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRequests } from "../../services/requestApi";
import { fetchMyOrders } from "../../services/orderApi";
import { fetchMyChats } from "../../services/chatApi";
import RequestDetails from "../../components/farmer/RequestDetails";
import LanguageSelection from "../../components/common/LanguageSelection";
import { getCurrentUser } from "../../utils/roleGuard";

function FarmerDashboard() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [requestToChat, setRequestToChat] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const [stats, setStats] = useState({
    openRequests: 0,
    activeOrders: 0,
    chats: 0,
  });

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fetchRequests();
      const list = Array.isArray(data) ? data : [];
      setRequests(list);
      setStats((prev) => ({
        ...prev,
        openRequests: list.filter((req) => (req?.status || "open") === "open").length,
        openRequests: list.filter(
          (req) => (req?.status || "open") === "open"
        ).length,
      }));
    } catch (error) {
      console.error("Failed to load requests", error);
      setRequests([]);
      setStats((prev) => ({ ...prev, openRequests: 0 }));
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user.role && user.role !== "farmer") {
      navigate("/login");
      return;
    }

    const loadDashboardStats = async () => {
      await loadRequests();

      try {
        const [orders, chats] = await Promise.all([fetchMyOrders(), fetchMyChats()]);
        const activeOrders = Array.isArray(orders)
          ? orders.filter((o) => !["delivered", "cancelled"].includes(o?.status)).length
          : 0;
        const [orders, chats] = await Promise.all([
          fetchMyOrders(),
          fetchMyChats(),
        ]);

        const activeOrders = Array.isArray(orders)
          ? orders.filter(
              (o) => !["delivered", "cancelled"].includes(o?.status)
            ).length
          : 0;

        const chatCount = Array.isArray(chats) ? chats.length : 0;

        setStats((prev) => ({
          ...prev,
          activeOrders,
          chats: chatCount,
        }));
      } catch (error) {
        console.error("Failed to load farmer dashboard stats", error);
      }
    };

    loadDashboardStats();
  }, [navigate]);

  const filteredRequests = requests.filter((req) =>
    (req?.product || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const handleStartChat = (request) => {
    setRequestToChat(request);
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (language) => {
    if (!requestToChat) return;

    setShowLanguageModal(false);
    navigate(`/chat/${requestToChat._id}`, {
      state: {
        request: requestToChat,
        userLanguage: language,
        chatContext: {
          requestId: requestToChat._id,
          otherUserId: requestToChat.dealerId,
        },
      },
    });
  };

  const formatPrice = (request) => {
    if (request?.minPrice !== undefined && request?.maxPrice !== undefined) {
      return `₹${request.minPrice} - ₹${request.maxPrice}`;
    }

    if (request?.priceExpected !== undefined && request?.priceExpected !== null) {
      return `${request.priceExpected}`;
    }

    return "Not specified";
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatPrice = (request) => {
    if (
      request?.minPrice !== undefined &&
      request?.maxPrice !== undefined
    ) {
      return `₹${request.minPrice} - ₹${request.maxPrice}`;
    }
    return request?.priceExpected ?? "Not specified";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Available Requests 🌾</h1>
        <button
          onClick={() => navigate("/farmer/orders")}
          className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          📦 Orders
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">Open Requests</p>
          <p className="text-2xl font-bold text-gray-900">{stats.openRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">My Active Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">My Chats</p>
          <p className="text-2xl font-bold text-gray-900">{stats.chats}</p>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-green-700">AgroFarm</h1>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Farmer
          </span>
        </div>
        
            <div className="flex items-center gap-3 sm:hidden relative">
              <button
                title="Orders"
                onClick={() => navigate('/farmer/orders')}
              >
                🛒
              </button>
       
           <button title="Chats" onClick={() => navigate('/farmer/chats')} className="relative">
                💬
                {stats.unreadChats > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                    {stats.unreadChats}
                  </span>
                )}
              </button>

          {/* 3 Dots */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-2xl px-2 hover:bg-gray-200 rounded"
          >
            ⋮
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-12 bg-white border rounded-xl shadow-lg w-40">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 rounded-xl"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">Open Requests</p>
          <p className="text-2xl font-bold">{stats.openRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">My Active Orders</p>
          <p className="text-2xl font-bold">{stats.activeOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">My Chats</p>
          <p className="text-2xl font-bold">{stats.chats}</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search requests..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full max-w-md"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRequests.length === 0 && <p className="text-gray-500">No requests found</p>}

        {filteredRequests.map((request, index) => (
          <div key={request?._id || `${request?.product || "request"}-${index}`} className="bg-white p-4 rounded shadow border">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{request?.productImage || "🌾"}</span>
              <h3 className="font-bold text-lg">{request?.product || "Unnamed Product"}</h3>
            </div>

            <p className="text-sm">Quantity: {request?.quantity ?? "-"} kg</p>
            <p className="text-sm">Price: {formatPrice(request)}</p>
            <p className="text-sm">Dealer: {request?.dealerName || request?.dealer || "Dealer"}</p>
            <p className="text-sm">Location: {request?.location || "India"}</p>

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleViewDetails(request)} className="flex-1 border px-3 py-1 rounded">
      {/* Requests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRequests.map((request, index) => (
          <div
            key={request?._id || index}
            className="bg-white p-4 rounded shadow border"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{request?.productImage || "🌾"}</span>
              <h3 className="font-bold text-lg">
                {request?.product || "Unnamed Product"}
              </h3>
            </div>

            <p className="text-sm">Quantity: {request?.quantity} kg</p>
            <p className="text-sm">Price: {formatPrice(request)}</p>
            <p className="text-sm">Dealer: {request?.dealer || "Dealer"}</p>
            <p className="text-sm">Location: {request?.location || "India"}</p>

            <div className="mt-3">
              <button
                onClick={() => handleViewDetails(request)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {showRequestDetails && selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => {
            setShowRequestDetails(false);
            setSelectedRequest(null);
          }}
          onStartChat={() => handleStartChat(selectedRequest)}
        />
      )}

      {showLanguageModal && (
        <LanguageSelection
          onClose={() => {
            setShowLanguageModal(false);
            setRequestToChat(null);
          }}
          onLanguageSelect={handleLanguageSelect}
        />
      )}
    </div>
  );
}

export default FarmerDashboard;


// import React, { useEffect, useState } from "react";
// import { useNavigate } fr om "react-router-dom";
// import { fetchRequests } from "../../services/requestApi";
// import { fetchMyOrders } from "../../services/orderApi";
// import { fetchMyChats } from "../../services/chatApi";
// import RequestDetails from "../../components/farmer/RequestDetails";
// import LanguageSelection from "../../components/common/LanguageSelection";
// import { getCurrentUser } from "../../utils/roleGuard";
// function FarmerDashboard() {
//   const navigate = useNavigate();

//   const [requests, setRequests] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [showRequestDetails, setShowRequestDetails] = useState(false);
//   const [showLanguageModal, setShowLanguageModal] = useState(false);
//   const [requestToChat, setRequestToChat] = useState(null);
//   const [stats, setStats] = useState({
//     openRequests: 0,
//     activeOrders: 0,
//     chats: 0,
//   });

//   const loadRequests = async () => {
//     try {
//       const data = await fetchRequests();
//       const list = Array.isArray(data) ? data : [];
//       setRequests(list);
//       setStats((prev) => ({
//         ...prev,
//         openRequests: list.filter(
//           (req) => (req?.status || "open") === "open"
//         ).length,
//       }));
//     } catch (error) {
//       console.error("Failed to load requests", error);
//       setRequests([]);
//       setStats((prev) => ({ ...prev, openRequests: 0 }));
//     }
//   };

//   useEffect(() => {
//     const user = getCurrentUser();
//     if (user.role && user.role !== "farmer") {
//       navigate("/login");
//       return;
//     }

//     const loadDashboardStats = async () => {
//       await loadRequests();

//       try {
//         const [orders, chats] = await Promise.all([
//           fetchMyOrders(),
//           fetchMyChats(),
//         ]);

//         const activeOrders = Array.isArray(orders)
//           ? orders.filter(
//               (o) => !["delivered", "cancelled"].includes(o?.status)
//             ).length
//           : 0;

//         const chatCount = Array.isArray(chats) ? chats.length : 0;

//         setStats((prev) => ({
//           ...prev,
//           activeOrders,
//           chats: chatCount,
//         }));
//       } catch (error) {
//         console.error("Failed to load farmer dashboard stats", error);
//       }
//     };

//     loadDashboardStats();
//   }, [navigate]);

//   const filteredRequests = requests.filter((req) =>
//     (req?.product || "").toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleViewDetails = (request) => {
//     setSelectedRequest(request);
//     setShowRequestDetails(true);
//   };

//   const handleStartChat = (request) => {
//     setRequestToChat(request);
//     setShowLanguageModal(true);
//   };

//   const handleLanguageSelect = (language) => {
//     if (!requestToChat) return;

//     setShowLanguageModal(false);
//     navigate(`/chat/${requestToChat._id}`, {
//       state: {
//         request: requestToChat,
//         userLanguage: language,
//         chatContext: {
//           requestId: requestToChat._id,
//           otherUserId: requestToChat.dealerId,
//         },
//       },
//     });
//   };

//   const formatPrice = (request) => {
//     if (
//       request?.minPrice !== undefined &&
//       request?.maxPrice !== undefined
//     ) {
//       return `₹${request.minPrice} - ₹${request.maxPrice}`;
//     }

//     if (
//       request?.priceExpected !== undefined &&
//       request?.priceExpected !== null
//     ) {
//       return `${request.priceExpected}`;
//     }

//     return "Not specified";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-4 mb-5">
//         <h1 className="text-3xl font-extrabold text-green-700">
//           AgroFarm
//         </h1>
//         <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
//                 Farmer
//               </span>
//             </div>
//                     <div className="flex items-center gap-4 relative" ref={menuRef}>


//         <button
//           onClick={() => navigate("/farmer/orders")}
//           className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-100"
//         >
//           🛒
//         </button>
//          {/* 3 Dots */}
//           <button
//             onClick={() => setShowMenu(!showMenu)}
//             className="text-2xl px-2 hover:bg-gray-200 rounded"
//           >
//             ⋮
//           </button>

//           {/* Dropdown */}
//           {showMenu && (
//             <div className="absolute right-0 top-12 bg-white border rounded-xl shadow-lg w-40">
//               <button
//                 onClick={handleLogout}
//                 className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 rounded-xl"
//               >
//                 🚪 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
  
//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
//         <div className="bg-white p-4 rounded-xl border shadow-sm">
//           <p className="text-sm text-gray-600">Open Requests</p>
//           <p className="text-2xl font-bold text-gray-900">
//             {stats.openRequests}
//           </p>
//         </div>

//         <div className="bg-white p-4 rounded-xl border shadow-sm">
//           <p className="text-sm text-gray-600">My Active Orders</p>
//           <p className="text-2xl font-bold text-gray-900">
//             {stats.activeOrders}
//           </p>
//         </div>

//         <div className="bg-white p-4 rounded-xl border shadow-sm">
//           <p className="text-sm text-gray-600">My Chats</p>
//           <p className="text-2xl font-bold text-gray-900">
//             {stats.chats}
//           </p>
//         </div>
//       </div>

//       {/* Search */}
//       <input
//         type="text"
//         placeholder="Search requests..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="mb-4 px-4 py-2 border rounded w-full max-w-md"
//       />

//       {/* Requests */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {filteredRequests.length === 0 && (
//           <p className="text-gray-500">No requests found</p>
//         )}

//         {filteredRequests.map((request, index) => (
//           <div
//             key={request?._id || `${request?.product}-${index}`}
//             className="bg-white p-4 rounded shadow border"
//           >
//             <div className="flex items-center gap-2">
//               <span className="text-2xl">
//                 {request?.productImage || "🌾"}
//               </span>
//               <h3 className="font-bold text-lg">
//                 {request?.product || "Unnamed Product"}
//               </h3>
//             </div>

//             <p className="text-sm">Quantity: {request?.quantity ?? "-"} kg</p>
//             <p className="text-sm">Price: {formatPrice(request)}</p>
//             <p className="text-sm">
//               Dealer: {request?.dealerName || request?.dealer || "Dealer"}
//             </p>
//             <p className="text-sm">
//               Location: {request?.location || "India"}
//             </p>

//             {}
//             <div className="mt-3">
//               <button
//                 onClick={() => handleViewDetails(request)}
//                 className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
//               >
//                 Details
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {}
//       {showRequestDetails && selectedRequest && (
//         <RequestDetails
//           request={selectedRequest}
//           onClose={() => {
//             setShowRequestDetails(false);
//             setSelectedRequest(null);
//           }}
//           onStartChat={() => handleStartChat(selectedRequest)}
//         />
//       )}

//       {/* Language Selection Modal */}
//       {showLanguageModal && (
//         <LanguageSelection
//           onClose={() => {
//             setShowLanguageModal(false);
//             setRequestToChat(null);
//           }}
//           onLanguageSelect={handleLanguageSelect}
//         />
//       )}
//     </div>
//   );
// }

// export default FarmerDashboard;
