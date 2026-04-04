import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRequests } from "../../services/requestApi";
import { fetchMyOrders } from "../../services/orderApi";
import { fetchMyChats } from "../../services/chatApi";
import { createComplaint, fetchMyComplaints } from "../../services/complaintApi";
import { fetchMyReviewSummary } from "../../services/reviewApi";
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
  const [myOrders, setMyOrders] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({
    type: "website_related",
    orderId: "",
    title: "",
    description: "",
  });
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);

  const [stats, setStats] = useState({
    openRequests: 0,
    activeOrders: 0,
    chats: 0,
    avgRating: "0.00",
    totalReviews: 0,
  });

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
        const [orders, chats, reviewSummary, complaints] = await Promise.all([fetchMyOrders(), fetchMyChats(), fetchMyReviewSummary(), fetchMyComplaints()]);
        const orderList = Array.isArray(orders) ? orders : [];
        setMyOrders(orderList);
        setMyComplaints(Array.isArray(complaints) ? complaints : []);

        const activeOrders = orderList.filter((o) => !["delivered", "cancelled"].includes(o?.status)).length;
        const chatCount = Array.isArray(chats) ? chats.length : 0;

        setStats((prev) => ({
          ...prev,
          activeOrders,
          chats: chatCount,
          avgRating: reviewSummary?.avgRating || "0.00",
          totalReviews: reviewSummary?.totalReviews || 0,
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      setComplaintSubmitting(true);
      await createComplaint({
        type: complaintData.type,
        orderId: complaintData.type === "order_related" ? complaintData.orderId : undefined,
        title: complaintData.title,
        description: complaintData.description,
      });
      alert("Complaint submitted successfully");
      setComplaintData({ type: "website_related", orderId: "", title: "", description: "" });
      setShowComplaintModal(false);
      const refreshed = await fetchMyComplaints();
      setMyComplaints(Array.isArray(refreshed) ? refreshed : []);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to submit complaint");
    } finally {
      setComplaintSubmitting(false);
    }
  };

  const formatPrice = (request) => {
    if (request?.minPrice !== undefined && request?.maxPrice !== undefined) {
      return `₹${request.minPrice} - ₹${request.maxPrice}`;
    }
    return request?.priceExpected ?? "Not specified";
  };

  const selectedOrder = myOrders.find((o) => String(o._id || o.id) === String(complaintData.orderId));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-green-700">AgroFarm</h1>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Farmer</span>
        </div>

        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <button title="Orders" onClick={() => navigate("/farmer/orders")} className="bg-white border px-3 py-2 rounded-lg hover:bg-gray-100">
            🛒 <span className="hidden sm:inline">Orders</span>
          </button>
          <button title="Chats" onClick={() => navigate("/farmer/chats")} className="bg-white border px-3 py-2 rounded-lg hover:bg-gray-100">
            💬 <span className="hidden sm:inline">Chats</span>
          </button>
          <button title="Raise Complaint" onClick={() => setShowComplaintModal(true)} className="bg-red-50 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 text-red-700">
            ⚠️ <span className="hidden sm:inline">Complaint</span>
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="text-2xl px-2 hover:bg-gray-200 rounded">⋮</button>

          {showMenu && (
            <div className="absolute right-0 top-12 bg-white border rounded-xl shadow-lg w-40">
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 rounded-xl">🚪 Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white p-4 rounded-xl border shadow-sm"><p className="text-sm text-gray-600">Open Requests</p><p className="text-2xl font-bold">{stats.openRequests}</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm"><p className="text-sm text-gray-600">My Active Orders</p><p className="text-2xl font-bold">{stats.activeOrders}</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm"><p className="text-sm text-gray-600">My Chats</p><p className="text-2xl font-bold">{stats.chats}</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-600">My Rating</p>
          <p className="text-2xl font-bold">{stats.avgRating}/10</p>
          <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
        </div>
      </div>

      <input type="text" placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mb-4 px-4 py-2 border rounded w-full max-w-md" />

      <section className="mb-5 bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">My Complaints (Phase 4)</h3>
          <span className="text-sm text-gray-500">{myComplaints.length}</span>
        </div>
        <div className="max-h-44 overflow-auto space-y-2">
          {myComplaints.slice(0, 8).map((c) => (
            <div key={c._id} className={`text-sm border rounded p-2 ${c.isOverdue ? "border-red-300 bg-red-50" : ""}`}>
              <p className="font-medium">{c.title} <span className="text-xs text-gray-500">({c.trackingId || "N/A"})</span></p>
              <p className="text-xs text-gray-600">{c.type} • {c.status} • {new Date(c.createdAt).toLocaleDateString("en-IN")}</p>
              {c.dueAt && <p className="text-xs text-gray-600">Due: {new Date(c.dueAt).toLocaleDateString("en-IN")} {c.isOverdue ? "• OVERDUE" : ""}</p>}
            </div>
          ))}
          {myComplaints.length === 0 && <p className="text-sm text-gray-500">No complaints raised yet.</p>}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRequests.map((request, index) => (
          <div key={request?._id || index} className="bg-white p-4 rounded shadow border">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{request?.productImage || "🌾"}</span>
              <h3 className="font-bold text-lg">{request?.product || "Unnamed Product"}</h3>
            </div>
            <p className="text-sm">Quantity: {request?.quantity} kg</p>
            <p className="text-sm">Price: {formatPrice(request)}</p>
            <p className="text-sm">Dealer: {request?.dealer || request?.dealerName || "Dealer"}</p>
            <p className="text-sm">Location: {request?.location || "India"}</p>
            <div className="mt-3">
              <button onClick={() => handleViewDetails(request)} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Details</button>
            </div>
          </div>
        ))}
      </div>

      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleComplaintSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-xl p-5 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Raise Complaint</h3>

            <div>
              <label className="block text-sm mb-1">Complaint Type</label>
              <select
                value={complaintData.type}
                onChange={(e) => setComplaintData((prev) => ({ ...prev, type: e.target.value, orderId: "" }))}
                className="w-full border rounded-lg p-2"
              >
                <option value="website_related">Website related</option>
                <option value="order_related">Order related</option>
              </select>
            </div>

            {complaintData.type === "order_related" && (
              <>
                <div>
                  <label className="block text-sm mb-1">Order</label>
                  <select
                    value={complaintData.orderId}
                    onChange={(e) => setComplaintData((prev) => ({ ...prev, orderId: e.target.value }))}
                    className="w-full border rounded-lg p-2"
                    required
                  >
                    <option value="">Select order</option>
                    {myOrders.map((order) => {
                      const id = order._id || order.id;
                      return (
                        <option key={id} value={id}>
                          {id} • {order.product} • {order.status}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedOrder && (
                  <div className="bg-gray-50 border rounded-lg p-3 text-sm">
                    <p><b>Product:</b> {selectedOrder.product}</p>
                    <p><b>Dealer:</b> {selectedOrder.dealerName || selectedOrder.dealer || "Dealer"}</p>
                    <p><b>Status:</b> {selectedOrder.status}</p>
                  </div>
                )}
              </>
            )}

            <input
              type="text"
              placeholder="Title"
              value={complaintData.title}
              onChange={(e) => setComplaintData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full border rounded-lg p-2"
              required
            />

            <textarea
              placeholder="Describe your issue"
              value={complaintData.description}
              onChange={(e) => setComplaintData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full border rounded-lg p-2"
              rows="4"
              required
            />

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowComplaintModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button disabled={complaintSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">
                {complaintSubmitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}

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
