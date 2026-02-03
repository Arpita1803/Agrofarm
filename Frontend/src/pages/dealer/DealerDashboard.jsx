import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestForm from '../../components/dealer/RequestForm';

// Mock data for categories and products
const categories = [
  {
    id: 1,
    name: 'Fruits',
    icon: '🍎',
    products: [
      { id: 1, name: 'Apple', image: '🍎', description: 'Fresh apples from local farms' },
      { id: 2, name: 'Orange', image: '🍊', description: 'Sweet and juicy oranges' },
      { id: 3, name: 'Mango', image: '🥭', description: 'Seasonal mango varieties' },
      { id: 4, name: 'Banana', image: '🍌', description: 'Ripe bananas' },
      { id: 5, name: 'Grapes', image: '🍇', description: 'Fresh grape bunches' },
    ]
  },
  {
    id: 2,
    name: 'Vegetables',
    icon: '🥦',
    products: [
      { id: 1, name: 'Tomato', image: '🍅', description: 'Fresh red tomatoes' },
      { id: 2, name: 'Broccoli', image: '🥦', description: 'Green broccoli' },
      { id: 3, name: 'Potato', image: '🥔', description: 'Farm fresh potatoes' },
      { id: 4, name: 'Onion', image: '🧅', description: 'Local onions' },
      { id: 5, name: 'Carrot', image: '🥕', description: 'Organic carrots' },
    ]
  },
  {
    id: 3,
    name: 'Cereals',
    icon: '🌾',
    products: [
      { id: 1, name: 'Rice', image: '🍚', description: 'Basmati rice' },
      { id: 2, name: 'Wheat', image: '🌾', description: 'Whole wheat grains' },
      { id: 3, name: 'Corn', image: '🌽', description: 'Sweet corn' },
      { id: 4, name: 'Oats', image: '🥣', description: 'Organic oats' },
    ]
  },
  {
    id: 4,
    name: 'Pulses',
    icon: '🫘',
    products: [
      { id: 1, name: 'Lentils', image: '🫘', description: 'Various lentil types' },
      { id: 2, name: 'Chickpeas', image: '🫘', description: 'High-quality chickpeas' },
      { id: 3, name: 'Beans', image: '🫘', description: 'Different bean varieties' },
    ]
  },
  {
    id: 5,
    name: 'Milk Products',
    icon: '🥛',
    products: [
      { id: 1, name: 'Milk', image: '🥛', description: 'Fresh milk' },
      { id: 2, name: 'Cheese', image: '🧀', description: 'Various cheese types' },
      { id: 3, name: 'Yogurt', image: '🍶', description: 'Fresh yogurt' },
    ]
  }
];

function DealerDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Mock data for quick stats
  const stats = {
    activeOrders: 3,
    pendingRequests: 2,
    totalChats: 5
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowRequestForm(true);
  };

  const handleViewAll = (category) => {
    navigate(`/dealer/category/${category.name.toLowerCase()}`);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.products.some(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">AGROTECH</h1>
              <span className="ml-4 text-sm text-gray-500 bg-green-100 px-2 py-1 rounded">Dealer</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
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

              {/* Navigation Icons */}
              <button 
                onClick={() => navigate('/dealer/orders')}
                className="relative p-2 text-gray-600 hover:text-green-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {stats.activeOrders > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.activeOrders}
                  </span>
                )}
              </button>

              <button 
                onClick={() => navigate('/dealer/chats')}
                className="relative p-2 text-gray-600 hover:text-green-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {stats.totalChats > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.totalChats}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition duration-300">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    D
                  </div>
                  <span>Dealer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600">Find fresh agricultural products from local farmers</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChats}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                </div>
                <button
                  onClick={() => handleViewAll(category)}
                  className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1 transition duration-300"
                >
                  <span>View All</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {category.products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-green-300 hover:shadow-md transition duration-300 group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition duration-300">
                      {product.image}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{product.description}</p>
                    <button className="w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition duration-300">
                      Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for Search */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </main>

      {/* Request Form Modal */}
      {showRequestForm && selectedProduct && (
        <RequestForm
          product={selectedProduct}
          onClose={() => {
            setShowRequestForm(false);
            setSelectedProduct(null);
          }}
          onSubmit={(requestData) => {
            console.log('Request submitted:', requestData);
            setShowRequestForm(false);
            setSelectedProduct(null);
            // Here you would typically make an API call
          }}
        />
      )}
    </div>
  );
}

export default DealerDashboard;