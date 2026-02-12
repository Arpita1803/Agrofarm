import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { acceptRequest, fetchRequests } from "../../services/requestApi";
import { fetchMyOrders } from "../../services/orderApi";
import { fetchMyChats } from "../../services/chatApi";
import RequestDetails from "../../components/farmer/RequestDetails";
import LanguageSelection from "../../components/common/LanguageSelection";
import { getCurrentUser } from "../../utils/roleGuard";

function FarmerDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [requestToChat, setRequestToChat] = useState(null);
  const [stats, setStats] = useState({
    openRequests: 0,
    activeOrders: 0,
    chats: 0,
  });

  const loadRequests = async () => {
    try {
      const data = await fetchRequests();
      const list = Array.isArray(data) ? data : [];
      setRequests(list);
      setStats((prev) => ({
        ...prev,
        openRequests: list.filter((req) => (req?.status || "open") === "open").length,
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

  const handleAcceptRequest = async (request) => {
    try {
      await acceptRequest(request._id);
      alert("Request accepted. Order created successfully.");

      setShowRequestDetails(false);
      setSelectedRequest(null);

      await loadRequests();
      navigate("/farmer/orders");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to accept request");
    }
  };

  const formatPrice = (request) => {
    if (request?.minPrice !== undefined && request?.maxPrice !== undefined) {
      return `₹${request.minPrice} - ₹${request.maxPrice}`;
    }

    if (request?.priceExpected !== undefined && request?.priceExpected !== null) {
      return `${request.priceExpected}`;
    }

    return "Not specified";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Available Requests 🌾</h1>

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
        </div>
      </div>

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
                Details
              </button>

              <button
                onClick={() => handleStartChat(request)}
                className="flex-1 bg-green-600 text-white px-3 py-1 rounded"
              >
                Chat
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
          onAcceptRequest={handleAcceptRequest}
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