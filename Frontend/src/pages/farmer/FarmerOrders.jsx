import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetails from '../../components/orders/OrderDetails';
import { fetchMyOrders, updateOrderStatus } from '../../services/orderApi';

const statusFilterDefs = [
  { id: 'all', label: 'All Orders' },
  { id: 'placed', label: 'Placed' },
  { id: 'packed', label: 'Packed' },
  { id: 'ready_for_delivery', label: 'Ready for Delivery' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'out_for_pickup', label: 'Out for Pickup' },
  { id: 'picked', label: 'Picked' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' }
];

const statusProgressMap = {
  placed: 10,
  packed: 25,
  ready_for_delivery: 45,
  shipped: 60,
  out_for_delivery: 80,
  out_for_pickup: 70,
  picked: 85,
  delivered: 100,
  cancelled: 0,
};

const statusColors = {
  placed: 'bg-yellow-100 text-yellow-800',
  packed: 'bg-orange-100 text-orange-800',
  ready_for_delivery: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  out_for_pickup: 'bg-purple-100 text-purple-800',
  picked: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  placed: 'Placed',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  out_for_pickup: 'Out for Pickup',
  picked: 'Picked',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

function FarmerOrders() {
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
    const status = order.status || 'placed';

    return {
      id: order._id || order.id,
      product: order.product || 'Product',
      image: order.productImage || order.image || '🌾',
      quantity,
      dealer: order.dealerName || order.dealer || 'Dealer',
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
        console.error('Failed to fetch farmer orders', error);
        setOrders([]);
      }
    };

    loadOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.dealer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => ['placed', 'packed', 'ready_for_delivery', 'shipped', 'out_for_delivery', 'out_for_pickup', 'picked'].includes(o.status)).length,
    totalEarnings: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.grandTotal, 0),
    pendingPayment: orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + o.grandTotal, 0)
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
    // Navigate to tracking page or open tracking modal
    alert(`Tracking order ${order.id}`);
  };

  const handleChat = (order) => {
    navigate(`/chat/order-${order.id}`, {
      state: {
        request: {
          product: order.product,
          dealer: order.dealer,
          image: order.image
        },
        chatContext: {
          orderId: order.id,
          otherUserId: order.dealerId,
        },
      }
    });
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order ${order.id}?`)) return;

    try {
      await updateOrderStatus(order.id, 'cancelled');
      applyLocalStatus(order.id, 'cancelled');
      alert(`Order ${order.id} cancellation requested.`);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to cancel order');
    }
  };


  const handleUpdateStatusFromDetails = async (status) => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.id, status);
      applyLocalStatus(selectedOrder.id, status);
      alert(`Order status updated to ${status}.`);
      setShowOrderDetails(false);
      setSelectedOrder(null);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'placed': return '🧾';
      case 'packed': return '📦';
      case 'ready_for_delivery': return '✅';
      case 'shipped': return '🚚';
      case 'out_for_delivery': return '🛵';
      case 'out_for_pickup': return '🏬';
      case 'picked': return '📥';
      case 'delivered': return '📬';
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
                onClick={() => navigate('/farmer/dashboard')}
                className="mr-4 text-gray-600 hover:text-green-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">📦</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">🔄</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Orders</p>
                <p className="text-xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">💰</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">⏳</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pending Payment</p>
                <p className="text-xl font-bold text-gray-900">₹{stats.pendingPayment.toLocaleString()}</p>
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

              {/* Order Details */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Dealer Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.dealer}</p>
                      <p className="text-xs text-gray-600">{order.location}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">D</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-600">Total Amount</p>
                        <p className="text-lg font-bold text-green-700">₹{order.grandTotal.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Delivery</p>
                        <p className="text-sm font-medium">{order.deliveryDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Order Progress</span>
                      <span>{order.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${order.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Ordered</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        order.paymentStatus === 'paid' ? 'bg-green-500' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="capitalize">{order.paymentStatus} Payment</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(order.lastUpdated).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition duration-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleTrackOrder(order)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition duration-300"
                  >
                    Track
                  </button>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleChat(order)}
                    className="flex-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition duration-300"
                  >
                    Chat
                  </button>
                  {['placed', 'packed'].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order)}
                      className="flex-1 px-2 py-1.5 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100 transition duration-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          userRole="farmer"
          onUpdateStatus={handleUpdateStatusFromDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onTrack={() => {
            setShowOrderDetails(false);
            handleTrackOrder(selectedOrder);
          }}
          onChat={() => {
            setShowOrderDetails(false);
            handleChat(selectedOrder);
          }}
          onCancel={() => {
            setShowOrderDetails(false);
            handleCancelOrder(selectedOrder);
          }}
        />
      )}
    </div>
  );
}

export default FarmerOrders;