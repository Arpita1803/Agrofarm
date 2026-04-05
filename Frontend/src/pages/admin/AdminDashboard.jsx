import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminDashboard } from "../../services/adminApi";
import { addComplaintMessage as addComplaintMessageApi, bulkUpdateAdminComplaints, exportAdminComplaintsCsv, fetchAdminComplaints, fetchComplaintMetrics, updateComplaintByAdmin } from "../../services/complaintApi";
import { fetchAdminReviews, moderateReviewByAdmin } from "../../services/reviewApi";
import { getCurrentUser } from "../../utils/roleGuard";

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: {}, users: [], ads: [], orders: [], complaintCount: 0, complaints: [] });
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [complaintFilters, setComplaintFilters] = useState({ status: "all", type: "all", priority: "all", q: "" });
  const [complaintMetrics, setComplaintMetrics] = useState({ open: 0, inProgress: 0, resolved: 0, rejected: 0, escalated: 0, overdue: 0, byPriority: { low: 0, medium: 0, high: 0 }, avgResolutionHours: 0, waitingOnAdmin: 0, waitingOnUser: 0 });
  const [selectedComplaintIds, setSelectedComplaintIds] = useState([]);
  const [bulkAction, setBulkAction] = useState({ status: "", priority: "", assignToMe: true, adminNote: "" });

  const loadDashboard = async () => {
    try {
      const [dashboard, reviewList, complaintList, metrics] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminReviews(reviewFilter),
        fetchAdminComplaints(complaintFilters),
        fetchComplaintMetrics(),
      ]);
      const safe = dashboard || { summary: {}, users: [], ads: [], orders: [], complaintCount: 0, complaints: [] };
      setData(safe);
      setComplaints(Array.isArray(complaintList) ? complaintList : []);
      setSelectedComplaintIds([]);
      setReviews(Array.isArray(reviewList) ? reviewList : []);
      setComplaintMetrics(metrics || { open: 0, inProgress: 0, resolved: 0, rejected: 0, escalated: 0, overdue: 0, byPriority: { low: 0, medium: 0, high: 0 }, avgResolutionHours: 0, waitingOnAdmin: 0, waitingOnUser: 0 });
    } catch (error) {
      console.error("Failed to load admin dashboard", error);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user.role !== "admin") {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [navigate, reviewFilter, complaintFilters]);

  const handleComplaintStatus = async (id, status) => {
    try {
      await updateComplaintByAdmin(id, { status });
      await loadDashboard();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update complaint");
    }
  };

  const handleComplaintQuickUpdate = async (id, payload) => {
    try {
      await updateComplaintByAdmin(id, payload);
      await loadDashboard();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update complaint");
    }
  };

  const refreshComplaintsOnly = async () => {
    try {
      const [list, metrics] = await Promise.all([
        fetchAdminComplaints(complaintFilters),
        fetchComplaintMetrics(),
      ]);
      setComplaints(Array.isArray(list) ? list : []);
      setComplaintMetrics(metrics || complaintMetrics);
    } catch (error) {
      console.error("Failed to refresh complaints", error);
    }
  };

  const selectAllVisibleComplaints = () => {
    setSelectedComplaintIds((prev) => {
      const visibleIds = complaints.map((c) => c._id);
      const allSelected = visibleIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const handleReviewModeration = async (id, moderationStatus) => {
    try {
      await moderateReviewByAdmin(id, { moderationStatus });
      await loadDashboard();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to moderate review");
    }
  };

  const toggleComplaintSelection = (id) => {
    setSelectedComplaintIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkApply = async () => {
    if (selectedComplaintIds.length === 0) {
      alert("Select at least one complaint");
      return;
    }
    if (!bulkAction.status && !bulkAction.priority && !bulkAction.adminNote && !bulkAction.assignToMe) {
      alert("Choose at least one bulk action field");
      return;
    }
    try {
      await bulkUpdateAdminComplaints({
        ids: selectedComplaintIds,
        status: bulkAction.status || undefined,
        priority: bulkAction.priority || undefined,
        assignToMe: bulkAction.assignToMe,
        adminNote: bulkAction.adminNote || undefined,
        rejectionReason: bulkAction.status === "rejected" ? (bulkAction.adminNote || "Rejected by admin") : undefined,
      });
      setBulkAction({ status: "", priority: "", assignToMe: true, adminNote: "" });
      await loadDashboard();
    } catch (error) {
      alert(error?.response?.data?.message || "Bulk update failed");
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await exportAdminComplaintsCsv();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `complaints-export-${Date.now()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to export complaints CSV");
    }
  };

  const handleAddComplaintReply = async (id, message) => {
    if (!String(message || "").trim()) return;
    try {
      await addComplaintMessageApi(id, { message });
      await loadDashboard();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add complaint reply");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Monitor users, ads, orders, complaints and MSP governance.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/msp')} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">MSP Management</button>
            <button onClick={refreshComplaintsOnly} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">Refresh Complaints</button>
            <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Users</p><p className="text-2xl font-bold">{data.summary?.totalUsers || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Ads</p><p className="text-2xl font-bold">{data.summary?.totalAds || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Orders</p><p className="text-2xl font-bold">{data.summary?.totalOrders || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Complaints</p><p className="text-2xl font-bold text-red-600">{data.complaintCount || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Reviews</p><p className="text-2xl font-bold text-blue-700">{data.reviewCount || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Hidden Reviews</p><p className="text-2xl font-bold text-amber-700">{data.hiddenReviewCount || 0}</p></div>
        </div>

        <section className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Complaints Management (Phase 9)</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={handleExportCsv} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Export CSV</button>
            <button onClick={selectAllVisibleComplaints} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Select / Unselect Visible</button>
            <span className="text-xs text-gray-500 self-center">Selected: {selectedComplaintIds.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3 p-2 border rounded-lg bg-gray-50">
            <select value={bulkAction.status} onChange={(e) => setBulkAction((p) => ({ ...p, status: e.target.value }))} className="border rounded p-2 text-sm">
              <option value="">Bulk status</option>
              <option value="open">open</option>
              <option value="in_progress">in_progress</option>
              <option value="resolved">resolved</option>
              <option value="rejected">rejected</option>
            </select>
            <select value={bulkAction.priority} onChange={(e) => setBulkAction((p) => ({ ...p, priority: e.target.value }))} className="border rounded p-2 text-sm">
              <option value="">Bulk priority</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input value={bulkAction.adminNote} onChange={(e) => setBulkAction((p) => ({ ...p, adminNote: e.target.value }))} placeholder="Bulk admin note" className="border rounded p-2 text-sm" />
            <label className="text-sm flex items-center gap-2 px-2"><input type="checkbox" checked={bulkAction.assignToMe} onChange={(e) => setBulkAction((p) => ({ ...p, assignToMe: e.target.checked }))} />Assign to me</label>
            <button onClick={handleBulkApply} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Apply Bulk</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-10 gap-2 mb-3 text-center">
            <div className="border rounded p-2"><p className="text-xs text-gray-500">Open</p><p className="font-semibold">{complaintMetrics.open}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-gray-500">In Progress</p><p className="font-semibold">{complaintMetrics.inProgress}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-gray-500">Resolved</p><p className="font-semibold">{complaintMetrics.resolved}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-gray-500">Rejected</p><p className="font-semibold">{complaintMetrics.rejected}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-amber-600">Escalated</p><p className="font-semibold text-amber-700">{complaintMetrics.escalated}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-red-600">Overdue</p><p className="font-semibold text-red-700">{complaintMetrics.overdue}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-gray-500">High Priority</p><p className="font-semibold">{complaintMetrics?.byPriority?.high || 0}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-gray-500">Avg Resolution (hrs)</p><p className="font-semibold">{complaintMetrics?.avgResolutionHours || 0}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-indigo-600">Waiting on Admin</p><p className="font-semibold text-indigo-700">{complaintMetrics?.waitingOnAdmin || 0}</p></div>
            <div className="border rounded p-2"><p className="text-xs text-teal-600">Waiting on User</p><p className="font-semibold text-teal-700">{complaintMetrics?.waitingOnUser || 0}</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <select value={complaintFilters.status} onChange={(e) => setComplaintFilters((p) => ({ ...p, status: e.target.value }))} className="border rounded p-2 text-sm">
              <option value="all">All status</option>
              <option value="open">open</option>
              <option value="in_progress">in_progress</option>
              <option value="resolved">resolved</option>
              <option value="rejected">rejected</option>
            </select>
            <select value={complaintFilters.type} onChange={(e) => setComplaintFilters((p) => ({ ...p, type: e.target.value }))} className="border rounded p-2 text-sm">
              <option value="all">All type</option>
              <option value="order_related">order_related</option>
              <option value="website_related">website_related</option>
            </select>
            <select value={complaintFilters.priority} onChange={(e) => setComplaintFilters((p) => ({ ...p, priority: e.target.value }))} className="border rounded p-2 text-sm">
              <option value="all">All priority</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input value={complaintFilters.q} onChange={(e) => setComplaintFilters((p) => ({ ...p, q: e.target.value }))} placeholder="Search tracking/title" className="border rounded p-2 text-sm" />
          </div>

          <div className="max-h-80 overflow-auto space-y-2">
            {complaints.map((item) => (
              <div key={item._id} className={`border rounded-lg p-3 text-sm ${item.isOverdue ? "border-red-300 bg-red-50" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedComplaintIds.includes(item._id)} onChange={() => toggleComplaintSelection(item._id)} />
                    <p className="font-medium">{item.title} <span className="text-xs text-gray-500">({item.trackingId})</span></p>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => handleComplaintStatus(item._id, e.target.value)}
                    className="border rounded p-1 text-xs"
                  >
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="resolved">resolved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </div>
                <p className="text-gray-600 mt-1">Type: {item.type} • Priority: {item.priority}</p>
                <p className="text-gray-600 mt-1">Due: {item?.dueAt ? new Date(item.dueAt).toLocaleString("en-IN") : "N/A"} {item.isOverdue ? "• OVERDUE" : ""}</p>
                <p className="text-gray-600 mt-1">Assigned admin: {item?.assignedAdminId?.name || "Unassigned"}</p>
                {item.resolvedAt && <p className="text-gray-600 mt-1">Resolved at: {new Date(item.resolvedAt).toLocaleString("en-IN")}</p>}
                {item.rejectionReason && <p className="text-red-700 mt-1">Rejection reason: {item.rejectionReason}</p>}
                <p className="text-gray-700 mt-1">{item.description}</p>
                <p className="text-gray-500 mt-1">Raised by: {item?.raisedByUserId?.name || "Unknown"} ({item.raisedByRole})</p>
                {item.orderId && <p className="text-gray-500">Order Ref: {item.orderId?._id || item.orderId} • {item.orderId?.product || "Order"} ({item.orderId?.status || ""})</p>}
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select
                    value={item.priority}
                    onChange={(e) => handleComplaintQuickUpdate(item._id, { priority: e.target.value })}
                    className="border rounded p-1 text-xs"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                  <input
                    defaultValue={item.adminNote || ""}
                    placeholder="Admin note"
                    onBlur={(e) => handleComplaintQuickUpdate(item._id, { adminNote: e.target.value })}
                    className="border rounded p-1 text-xs"
                  />
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleComplaintQuickUpdate(item._id, { assignToMe: true })}
                    className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    Assign to me
                  </button>
                  {item.status === "rejected" && (
                    <input
                      defaultValue={item.rejectionReason || ""}
                      placeholder="Rejection reason"
                      onBlur={(e) => handleComplaintQuickUpdate(item._id, { status: "rejected", rejectionReason: e.target.value })}
                      className="border rounded p-1 text-xs"
                    />
                  )}
                </div>
                <input
                  placeholder="Add reply for user"
                  className="mt-2 border rounded p-1 text-xs w-full"
                  onBlur={(e) => {
                    handleAddComplaintReply(item._id, e.target.value);
                    e.target.value = "";
                  }}
                />
                {Array.isArray(item.messages) && item.messages.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Conversation messages: {item.messages.length}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">History events: {item?.history?.length || 0} • Escalation: L{item?.escalationLevel || 0}</p>
              </div>
            ))}
            {complaints.length === 0 && <p className="text-sm text-gray-500">No complaints yet.</p>}
          </div>
        </section>

        <section className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-semibold">Reviews Management (Phase 3)</h2>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="max-h-80 overflow-auto space-y-2">
            {reviews.map((item) => (
              <div key={item._id} className="border rounded-lg p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {item?.orderId?.product || "Order"} • {Number(item.rating).toFixed(1)}/10
                  </p>
                  <select
                    value={item.moderationStatus || "visible"}
                    onChange={(e) => handleReviewModeration(item._id, e.target.value)}
                    className="border rounded p-1 text-xs"
                  >
                    <option value="visible">visible</option>
                    <option value="hidden">hidden</option>
                  </select>
                </div>
                <p className="text-gray-600 mt-1">
                  By: {item?.reviewerId?.name || "Unknown"} ({item?.reviewerRole}) → {item?.revieweeId?.name || "Unknown"} ({item?.revieweeRole})
                </p>
                {item.reviewText && <p className="text-gray-700 mt-1">{item.reviewText}</p>}
                <p className="text-gray-500 mt-1">Photos: {item?.photoUrls?.length || 0}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews found.</p>}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-white border rounded-xl p-4 lg:col-span-1 shadow-sm">
            <h2 className="font-semibold mb-3">User Details</h2>
            <div className="max-h-[420px] overflow-auto space-y-2">
              {data.users?.map((user) => (
                <div key={user._id} className="border rounded-lg p-3 flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                  <span className="capitalize text-xs px-2 py-1 rounded bg-gray-100 h-fit">{user.role}</span>
                </div>
              ))}
              {(!data.users || data.users.length === 0) && <p className="text-gray-500 text-sm">No users found.</p>}
            </div>
          </section>

          <section className="bg-white border rounded-xl p-4 lg:col-span-2 shadow-sm">
            <h2 className="font-semibold mb-3">Order & Ad Details</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Posted Ads</h3>
                <div className="max-h-72 overflow-auto space-y-2">
                  {data.ads?.map((ad) => (
                    <div key={ad._id} className="border rounded p-2 text-sm">
                      <p className="font-medium">{ad.product}</p>
                      <p className="text-gray-600">Qty: {ad.quantity} • ₹{ad.price}</p>
                    </div>
                  ))}
                  {(!data.ads || data.ads.length === 0) && <p className="text-gray-500 text-sm">No ads posted yet.</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Accepted Orders</h3>
                <div className="max-h-72 overflow-auto space-y-2">
                  {data.orders?.map((order) => (
                    <div key={order._id} className="border rounded p-2 text-sm">
                      <p className="font-medium">{order.product}</p>
                      <p className="text-gray-600">Dealer: {order.dealerName} • Farmer: {order.farmerName}</p>
                      <p className="text-gray-600">Status: {order.status}</p>
                    </div>
                  ))}
                  {(!data.orders || data.orders.length === 0) && <p className="text-gray-500 text-sm">No accepted orders yet.</p>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;