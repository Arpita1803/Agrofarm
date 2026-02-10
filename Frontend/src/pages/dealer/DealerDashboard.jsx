import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestForm from '../../components/dealer/RequestForm';

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
  const [showMenu, setShowMenu] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.products.some(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:justify-between gap-3">

          {/* LEFT */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-green-800">
                AGROFARM
              </h1>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Dealer
              </span>
            </div>

            {/* Mobile Icons */}
            <div className="flex items-center gap-3 sm:hidden relative">
              <button
                title="Orders"
                onClick={() => navigate('/dealer/orders')}
              >
                🛒
              </button>

              <button
                title="Chats"
                onClick={() => navigate('/dealer/chats')}
              >
                💬
              </button>

              {/* 3 DOTS */}
              <button
                title="More options"
                onClick={() => setShowMenu(!showMenu)}
              >
                ⋮
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />

            {/* Desktop Icons */}
            <div className="hidden sm:flex items-center gap-3 relative">
              <button title="Orders" onClick={() => navigate('/dealer/orders')}>
                🛒
              </button>

              <button title="Chats" onClick={() => navigate('/dealer/chats')}>
                💬
              </button>

              {/* 3 DOTS */}
              <button
                title="More options"
                onClick={() => setShowMenu(!showMenu)}
              >
                ⋮
              </button>
            </div>

            {/* DROPDOWN MENU */}
            {showMenu && (
              <div className="absolute right-0 top-12 bg-white border rounded-xl shadow-lg w-40 z-50">
                <button
                  title="View Profile"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/dealer/profile');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  👤 Profile
                </button>

                <button
                  title="Logout"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        <h2 className="text-2xl font-bold mb-6">
          Welcome back 👋
        </h2>

        {/* PRICE PREDICTION */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dealer/price-prediction')}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
          >
            💰 Price Prediction
          </button>
        </div>

        {/* CATEGORIES */}
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {category.icon} {category.name}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.products.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowRequestForm(true);
                  }}
                  className="bg-gray-50 border rounded-xl p-4 cursor-pointer 
                             hover:shadow-md hover:-translate-y-1 transition 
                             active:scale-95"
                >
                  <div className="text-4xl text-center mb-2">
                    {product.image}
                  </div>
                  <h4 className="font-semibold text-sm text-center">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {product.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* REQUEST MODAL */}
      {showRequestForm && selectedProduct && (
        <RequestForm
          product={selectedProduct}
          onClose={() => setShowRequestForm(false)}
          onSubmit={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
}

export default DealerDashboard;
