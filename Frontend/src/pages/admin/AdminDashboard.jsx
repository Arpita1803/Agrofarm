import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminDashboard } from "../../services/adminApi";
import { getCurrentUser } from "../../utils/roleGuard";

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: {}, users: [], ads: [], orders: [], complaintCount: 0 });

  useEffect(() => {
    const user = getCurrentUser();
    if (user.role !== "admin") {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const dashboard = await fetchAdminDashboard();
        setData(dashboard || { summary: {}, users: [], ads: [], orders: [], complaintCount: 0 });
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      }
    };

    load();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={() => navigate('/login')} className="px-3 py-2 rounded border">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Users</p><p className="text-2xl font-bold">{data.summary?.totalUsers || 0}</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Ads</p><p className="text-2xl font-bold">{data.summary?.totalAds || 0}</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Orders</p><p className="text-2xl font-bold">{data.summary?.totalOrders || 0}</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Complaints Received</p><p className="text-2xl font-bold">{data.complaintCount || 0}</p></div>
        </div>

        <button onClick={() => navigate('/admin/msp')} className="w-full text-left bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition">
          <p className="font-semibold text-green-900">MSP Management</p>
          <p className="text-sm text-green-700">Open MSP page for 23 crops, view current MSPs and update values.</p>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border rounded-xl p-4">
            <h2 className="font-semibold mb-3">1) User Details (Farmers + Dealers)</h2>
            <div className="max-h-80 overflow-auto text-sm">
              {data.users?.map((user) => (
                <div key={user._id} className="py-2 border-b flex justify-between">
                  <span>{user.name} ({user.role})</span>
                  <span className="text-gray-500">{user.email}</span>
                </div>
              ))}
              {(!data.users || data.users.length === 0) && <p className="text-gray-500">No users found.</p>}
            </div>
          </section>

          <section className="bg-white border rounded-xl p-4">
            <h2 className="font-semibold mb-3">2) Order Details (Ads + Accepted Orders)</h2>
            <div className="max-h-80 overflow-auto text-sm space-y-4">
              <div>
                <h3 className="font-medium mb-2">Dealer/Farmer Ads</h3>
                {data.ads?.map((ad) => (
                  <div key={ad._id} className="py-2 border-b">{ad.product} • Qty: {ad.quantity} • ₹{ad.price}</div>
                ))}
                {(!data.ads || data.ads.length === 0) && <p className="text-gray-500">No ads posted yet.</p>}
              </div>
              <div>
                <h3 className="font-medium mb-2">Orders accepted by farmers</h3>
                {data.orders?.map((order) => (
                  <div key={order._id} className="py-2 border-b">{order.product} • Dealer: {order.dealerName} • Farmer: {order.farmerName} • Status: {order.status}</div>
                ))}
                {(!data.orders || data.orders.length === 0) && <p className="text-gray-500">No accepted orders yet.</p>}
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-2">3) Complaint Section</h2>
          <p className="text-sm text-gray-700">Total complaints received: <b>{data.complaintCount || 0}</b></p>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;