import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetails from '../../components/orders/OrderDetails';
import { fetchMyOrders, updateOrderStatus } from '../../services/orderApi';

const statusFilterDefs = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' }
];

const statusProgressMap = {
  pending: 20,
  accepted: 35,
  processing: 60,
  shipped: 85,
  delivered: 100,
  cancelled: 0,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

function DealerOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orders, setOrders] = useState([]);

  const normalizeOrder = (order) => {
    const pricePerKg = Number(order.agreedPrice ?? order.pricePerKg ?? 0);
    const quantity = Number(order.quantity ?? 0);
    const deliveryCost = Number(order.deliveryCost ?? 0);
    const totalAmount = Number(order.totalAmount ?? pricePerKg * quantity);
    const grandTotal = Number(order.grandTotal ?? totalAmount + deliveryCost);
    const status = order.status || 'pending';

    return {
      id: order._id || order.id,
      product: order.product || 'Product',
      image: order.productImage || order.image || '🌾',
      quantity,
      farmer: order.farmerName || order.farmer || 'Farmer',
      pricePerKg,
      totalAmount,
      deliveryCost,
      grandTotal,
      orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
      deliveryDate: order.deliveryDate || 'TBD',
      status,
      progress: order.progress ?? statusProgressMap[status] ?? 0,
      location: order.location || 'India',
      notes: order.notes || '',
      deliveryMode: order.deliveryMode || 'farmer_delivery',
      meetingPlace: order.meetingPlace || 'To be discussed',
      paymentStatus: order.paymentStatus || 'pending',
      farmerRating: order.farmerRating || 4.5,
      lastUpdated: order.updatedAt || order.lastUpdated || order.createdAt || new Date().toISOString(),
      farmerId: order.farmerId,
      dealerId: order.dealerId,
    };
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchMyOrders();
        const normalized = Array.isArray(data) ? data.map(normalizeOrder) : [];
        setOrders(normalized);
      } catch (error) {
        console.error('Failed to fetch dealer orders', error);
        setOrders([]);
      }
    };

    loadOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => ['pending', 'accepted', 'processing', 'shipped'].includes(o.status)).length,
    totalSpent: orders.reduce((sum, o) => sum + o.grandTotal, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length
  };

  const applyLocalStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              progress: statusProgressMap[status] ?? o.progress,
              lastUpdated: new Date().toISOString(),
            }
          : o
      )
    );

    setSelectedOrder((prev) => {
      if (!prev || prev.id !== orderId) return prev;
      return {
        ...prev,
        status,
        progress: statusProgressMap[status] ?? prev.progress,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleTrackOrder = (order) => {
    alert(`Tracking order ${order.id}`);
  };

  const handleChat = (order) => {
    navigate(`/chat/order-${order.id}`, {
      state: {
        request: {
          product: order.product,
          farmer: order.farmer,
          image: order.image
        },
        chatContext: {
          orderId: order.id,
          otherUserId: order.farmerId,
        },
      }
    });
  };

  const handleAcceptOrder = async (order) => {
    if (!window.confirm(`Accept order ${order.id} from ${order.farmer}?`)) return;

    try {
      await updateOrderStatus(order.id, 'accepted');
      applyLocalStatus(order.id, 'accepted');
      alert(`Order ${order.id} accepted.`);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (order) => {
    if (!window.confirm(`Reject order ${order.id}?`)) return;

    try {
      await updateOrderStatus(order.id, 'cancelled');
      applyLocalStatus(order.id, 'cancelled');
      alert(`Order ${order.id} rejected.`);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to reject order');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'processing': return '🔄';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dealer/dashboard')}
                className="mr-4 text-gray-600 hover:text-green-600 transition duration-300"
@@ -266,70 +275,73 @@ function DealerOrders() {
                <span className="text-yellow-600 text-lg">💰</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Value</p>
                <p className="text-xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pending Review</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusFilterDefs.map((filter) => {
              const count = filter.id === "all" ? orders.length : orders.filter((o) => o.status === filter.id).length;
              return (
              <button
                key={filter.id}
                onClick={() => setSelectedStatus(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center space-x-2 ${
                  selectedStatus === filter.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedStatus === filter.id
                    ? 'bg-white text-green-600'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
            })}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden hover:shadow-md transition duration-300"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{order.image}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{order.product}</h3>
                      <p className="text-xs text-gray-600">{order.id} • {order.quantity} kg</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                    {getStatusIcon(order.status)} {statusLabels[order.status]}
                  </span>
                </div>
              </div>
              