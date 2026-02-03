import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetails from '../../components/orders/OrderDetails';

// Mock order data for dealer
const mockOrders = [
  {
    id: 'ORD-001',
    product: 'Tomato',
    image: '🍅',
    quantity: 50,
    farmer: 'Singh Farms',
    pricePerKg: 12,
    totalAmount: 600,
    deliveryCost: 50,
    grandTotal: 650,
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-18',
    status: 'accepted',
    progress: 75,
    location: 'Nashik, Maharashtra',
    notes: 'Fresh Roma tomatoes, Grade A quality',
    deliveryMode: 'farmer_delivery',
    meetingPlace: 'Rajesh Traders, Mumbai Central',
    paymentStatus: 'pending',
    farmerRating: 4.5,
    lastUpdated: '2024-01-16T14:30:00Z'
  },
  {
    id: 'ORD-002',
    product: 'Orange',
    image: '🍊',
    quantity: 100,
    farmer: 'Patel Orchards',
    pricePerKg: 11,
    totalAmount: 1100,
    deliveryCost: 100,
    grandTotal: 1200,
    orderDate: '2024-01-14',
    deliveryDate: '2024-01-20',
    status: 'processing',
    progress: 50,
    location: 'Nagpur, Maharashtra',
    notes: 'Navel oranges, sweet and juicy',
    deliveryMode: 'dealer_pickup',
    meetingPlace: 'Farm location',
    paymentStatus: 'pending',
    farmerRating: 4.2,
    lastUpdated: '2024-01-15T10:15:00Z'
  },
  {
    id: 'ORD-003',
    product: 'Broccoli',
    image: '🥦',
    quantity: 80,
    farmer: 'Green Valley Farms',
    pricePerKg: 28,
    totalAmount: 2240,
    deliveryCost: 80,
    grandTotal: 2320,
    orderDate: '2024-01-13',
    deliveryDate: '2024-01-17',
    status: 'pending',
    progress: 25,
    location: 'Pune, Maharashtra',
    notes: 'Fresh broccoli heads',
    deliveryMode: 'third_party',
    meetingPlace: 'Logistics warehouse',
    paymentStatus: 'pending',
    farmerRating: 4.8,
    lastUpdated: '2024-01-13T16:45:00Z'
  },
  {
    id: 'ORD-004',
    product: 'Potato',
    image: '🥔',
    quantity: 200,
    farmer: 'Kumar Farms',
    pricePerKg: 15,
    totalAmount: 3000,
    deliveryCost: 150,
    grandTotal: 3150,
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-15',
    status: 'delivered',
    progress: 100,
    location: 'Satara, Maharashtra',
    notes: 'Russet potatoes, size medium',
    deliveryMode: 'farmer_delivery',
    meetingPlace: 'Spud Distributors warehouse',
    paymentStatus: 'paid',
    farmerRating: 4.0,
    lastUpdated: '2024-01-15T16:20:00Z'
  }
];

const statusFilters = [
  { id: 'all', label: 'All Orders', count: 4 },
  { id: 'pending', label: 'Pending', count: 1 },
  { id: 'accepted', label: 'Accepted', count: 1 },
  { id: 'processing', label: 'Processing', count: 1 },
  { id: 'delivered', label: 'Delivered', count: 1 }
];

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

  // Filter orders
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    totalOrders: mockOrders.length,
    activeOrders: mockOrders.filter(o => ['pending', 'accepted', 'processing'].includes(o.status)).length,
    totalSpent: mockOrders.reduce((sum, o) => sum + o.grandTotal, 0),
    pendingOrders: mockOrders.filter(o => o.status === 'pending').length
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
        }
      }
    });
  };

  const handleAcceptOrder = (order) => {
    if (window.confirm(`Accept order ${order.id} from ${order.farmer}?`)) {
      alert(`Order ${order.id} accepted.`);
      // In real app, update order status via API
    }
  };

  const handleRejectOrder = (order) => {
    if (window.confirm(`Reject order ${order.id}?`)) {
      alert(`Order ${order.id} rejected.`);
      // In real app, update order status via API
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
            {statusFilters.map((filter) => (
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
                  {filter.count}
                </span>
              </button>
            ))}
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
                  {/* Farmer Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.farmer}</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-xs text-gray-600">{order.farmerRating}/5</span>
                        <span className="text-xs text-gray-500">• {order.location}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">F</span>
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
                      <span>Processing</span>
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
                
                {/* Status-specific actions */}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleChat(order)}
                    className="flex-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition duration-300"
                  >
                    Chat
                  </button>
                  
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptOrder(order)}
                        className="flex-1 px-2 py-1.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition duration-300"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order)}
                        className="flex-1 px-2 py-1.5 bg-red-50 text-red-700 rounded text-xs hover:bg-red-100 transition duration-300"
                      >
                        Reject
                      </button>
                    </>
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
          userRole="dealer"
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
          onAccept={() => {
            setShowOrderDetails(false);
            handleAcceptOrder(selectedOrder);
          }}
          onReject={() => {
            setShowOrderDetails(false);
            handleRejectOrder(selectedOrder);
          }}
        />
      )}
    </div>
  );
}

export default DealerOrders;