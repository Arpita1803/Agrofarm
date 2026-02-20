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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Monitor users, ads, orders and MSP governance.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/msp')} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
              MSP Management
            </button>
            <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Users</p><p className="text-2xl font-bold">{data.summary?.totalUsers || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Ads</p><p className="text-2xl font-bold">{data.summary?.totalAds || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Total Orders</p><p className="text-2xl font-bold">{data.summary?.totalOrders || 0}</p></div>
          <div className="bg-white border rounded-xl p-4 shadow-sm"><p className="text-xs text-gray-500">Complaints</p><p className="text-2xl font-bold text-red-600">{data.complaintCount || 0}</p></div>
        </div>

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