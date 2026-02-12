
import React, { useState } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import RequestForm from '../../components/dealer/RequestForm';
import RequestForm from '../../components/dealer/RequestForm';
import { fetchRequests } from '../../services/requestApi';
import { fetchMyOrders } from '../../services/orderApi';
import { fetchMyChats } from '../../services/chatApi';
import { getCurrentUser } from '../../utils/roleGuard';


const categories = [
const categories = [
  {
  {
    id: 1,
    id: 1,
    name: 'Fruits',
    name: 'Fruits',
    icon: '🍎',
    icon: '🍎',
    products: [
    products: [
      { id: 1, name: 'Apple', image: '🍎', description: 'Fresh apples from local farms' },
      { id: 1, name: 'Apple', image: '🍎', description: 'Fresh apples from local farms' },
      { id: 2, name: 'Orange', image: '🍊', description: 'Sweet and juicy oranges' },
      { id: 2, name: 'Orange', image: '🍊', description: 'Sweet and juicy oranges' },
      { id: 3, name: 'Mango', image: '🥭', description: 'Seasonal mango varieties' },
      { id: 3, name: 'Mango', image: '🥭', description: 'Seasonal mango varieties' },
      { id: 4, name: 'Banana', image: '🍌', description: 'Ripe bananas' },
      { id: 4, name: 'Banana', image: '🍌', description: 'Ripe bananas' },
      { id: 5, name: 'Grapes', image: '🍇', description: 'Fresh grape bunches' },
      { id: 5, name: 'Grapes', image: '🍇', description: 'Fresh grape bunches' },
      { id: 6, name: 'Pomegranate', image: '🍎', description: 'Premium anar for juice and table use' },
      { id: 7, name: 'Guava', image: '🍏', description: 'Farm guava rich in nutrients' },
      { id: 8, name: 'Papaya', image: '🥭', description: 'Naturally ripened papaya' },
      { id: 9, name: 'Watermelon', image: '🍉', description: 'Summer watermelon stock' },
      { id: 10, name: 'Pineapple', image: '🍍', description: 'Fresh pineapple from growers' },
      { id: 11, name: 'Coconut', image: '🥥', description: 'Tender and mature coconuts' },
      { id: 12, name: 'Lemon', image: '🍋', description: 'Bulk lemon for retail and juice stalls' },
    ]
    ]
  },
  },
  {
  {
    id: 2,
    id: 2,
    name: 'Vegetables',
    name: 'Vegetables',
    icon: '🥦',
    icon: '🥦',
    products: [
    products: [
      { id: 1, name: 'Tomato', image: '🍅', description: 'Fresh red tomatoes' },
      { id: 1, name: 'Tomato', image: '🍅', description: 'Fresh red tomatoes' },
      { id: 2, name: 'Broccoli', image: '🥦', description: 'Green broccoli' },
      { id: 2, name: 'Broccoli', image: '🥦', description: 'Green broccoli' },
      { id: 3, name: 'Potato', image: '🥔', description: 'Farm fresh potatoes' },
      { id: 3, name: 'Potato', image: '🥔', description: 'Farm fresh potatoes' },
      { id: 4, name: 'Onion', image: '🧅', description: 'Local onions' },
      { id: 4, name: 'Onion', image: '🧅', description: 'Local onions' },
      { id: 5, name: 'Carrot', image: '🥕', description: 'Organic carrots' },
      { id: 5, name: 'Carrot', image: '🥕', description: 'Organic carrots' },
      { id: 6, name: 'Cabbage', image: '🥬', description: 'Green cabbage and red cabbage' },
      { id: 7, name: 'Cauliflower', image: '🥦', description: 'Fresh cauliflower heads' },
      { id: 8, name: 'Brinjal', image: '🍆', description: 'Purple and green brinjal varieties' },
      { id: 9, name: 'Green Chilli', image: '🌶️', description: 'Spicy green chilli lots' },
      { id: 10, name: 'Capsicum', image: '🫑', description: 'Green/yellow/red capsicum' },
      { id: 11, name: 'Okra (Lady Finger)', image: '🥒', description: 'Tender bhindi from local farms' },
      { id: 12, name: 'Cucumber', image: '🥒', description: 'Fresh salad cucumbers' },
      { id: 13, name: 'Pumpkin', image: '🎃', description: 'Yellow and green pumpkin' },
      { id: 14, name: 'Bottle Gourd', image: '🥒', description: 'Lauki for daily vegetable markets' },
      { id: 15, name: 'Spinach', image: '🥬', description: 'Leafy spinach bundles' },
    ]
    ]
  },
  },
  {
  {
    id: 3,
    id: 3,
    name: 'Cereals',
    name: 'Cereals & Grains',
    icon: '🌾',
    icon: '🌾',
    products: [
    products: [
      { id: 1, name: 'Rice', image: '🍚', description: 'Basmati rice' },
      { id: 1, name: 'Rice', image: '🍚', description: 'Basmati and non-basmati rice' },
      { id: 2, name: 'Wheat', image: '🌾', description: 'Whole wheat grains' },
      { id: 2, name: 'Wheat', image: '🌾', description: 'Whole wheat grains' },
      { id: 3, name: 'Corn', image: '🌽', description: 'Sweet corn' },
      { id: 3, name: 'Corn (Maize)', image: '🌽', description: 'Dry and sweet corn' },
      { id: 4, name: 'Oats', image: '🥣', description: 'Organic oats' },
      { id: 4, name: 'Oats', image: '🥣', description: 'Organic oats' },
      { id: 5, name: 'Barley', image: '🌾', description: 'Feed and malt grade barley' },
      { id: 6, name: 'Jowar (Sorghum)', image: '🌾', description: 'Millet grain for flour and feed' },
      { id: 7, name: 'Bajra (Pearl Millet)', image: '🌾', description: 'Bajra from dryland farms' },
      { id: 8, name: 'Ragi (Finger Millet)', image: '🌾', description: 'Nutri-cereal ragi lots' },
      { id: 9, name: 'Foxtail Millet', image: '🌾', description: 'Millet for health-conscious buyers' },
      { id: 10, name: 'Quinoa', image: '🌾', description: 'Premium quinoa growers produce' },
    ]
    ]
  },
  },
  {
  {
    id: 4,
    id: 4,
    name: 'Pulses',
    name: 'Pulses & Legumes',
    icon: '🫘',
    icon: '🫘',
    products: [
    products: [
      { id: 1, name: 'Lentils', image: '🫘', description: 'Various lentil types' },
      { id: 1, name: 'Toor Dal', image: '🫘', description: 'Pigeon pea lots' },
      { id: 2, name: 'Chickpeas', image: '🫘', description: 'High-quality chickpeas' },
      { id: 2, name: 'Moong Dal', image: '🫘', description: 'Green gram and split moong' },
      { id: 3, name: 'Beans', image: '🫘', description: 'Different bean varieties' },
      { id: 3, name: 'Urad Dal', image: '🫘', description: 'Black gram for wholesale buyers' },
      { id: 4, name: 'Masoor Dal', image: '🫘', description: 'Red lentils' },
      { id: 5, name: 'Chickpeas', image: '🫘', description: 'Kabuli and desi chana' },
      { id: 6, name: 'Rajma (Kidney Beans)', image: '🫘', description: 'Red and speckled rajma' },
      { id: 7, name: 'Cowpea', image: '🫘', description: 'Lobia for food and processing' },
      { id: 8, name: 'Field Peas', image: '🫘', description: 'Dry peas for pulse traders' },
    ]
    ]
  },
  },
  {
  {
    id: 5,
    id: 5,
    name: 'Milk Products',
    name: 'Oilseeds',
    icon: '🌻',
    products: [
      { id: 1, name: 'Groundnut', image: '🥜', description: 'Peanut with different shell grades' },
      { id: 2, name: 'Mustard Seed', image: '🌱', description: 'Black and yellow mustard' },
      { id: 3, name: 'Soybean', image: '🫘', description: 'High protein soybean lots' },
      { id: 4, name: 'Sunflower Seed', image: '🌻', description: 'Oil extraction grade sunflower' },
      { id: 5, name: 'Sesame (Til)', image: '🌱', description: 'White and black sesame' },
      { id: 6, name: 'Castor Seed', image: '🌱', description: 'Industrial oilseed castor' },
      { id: 7, name: 'Flaxseed', image: '🌱', description: 'Healthy omega-rich flaxseed' },
    ]
  },
  {
    id: 6,
    name: 'Spices',
    icon: '🧂',
    products: [
      { id: 1, name: 'Turmeric', image: '🧂', description: 'Fresh and dry turmeric fingers' },
      { id: 2, name: 'Red Chilli', image: '🌶️', description: 'Dry red chilli lots' },
      { id: 3, name: 'Coriander Seed', image: '🌿', description: 'Whole dhania seeds' },
      { id: 4, name: 'Cumin (Jeera)', image: '🌿', description: 'Premium jeera for spice traders' },
      { id: 5, name: 'Fenugreek (Methi)', image: '🌿', description: 'Methi seeds and leaves' },
      { id: 6, name: 'Black Pepper', image: '🧂', description: 'Whole pepper for spice market' },
      { id: 7, name: 'Cardamom', image: '🌿', description: 'Green elaichi packs' },
      { id: 8, name: 'Ginger', image: '🫚', description: 'Fresh ginger rhizomes' },
      { id: 9, name: 'Garlic', image: '🧄', description: 'Bulk garlic bulbs' },
    ]
  },
  {
    id: 7,
    name: 'Plantation & Cash Crops',
    icon: '☕',
    products: [
      { id: 1, name: 'Sugarcane', image: '🌾', description: 'Cane supply for mills and juice' },
      { id: 2, name: 'Cotton', image: '☁️', description: 'Raw kapas cotton lots' },
      { id: 3, name: 'Tea Leaves', image: '🍃', description: 'Fresh tea leaf procurement' },
      { id: 4, name: 'Coffee Beans', image: '☕', description: 'Arabica and robusta beans' },
      { id: 5, name: 'Jute', image: '🌾', description: 'Jute fiber crop supply' },
      { id: 6, name: 'Tobacco', image: '🍂', description: 'Cured tobacco leaves' },
    ]
  },
  {
    id: 8,
    name: 'Milk & Animal Products',
    icon: '🥛',
    icon: '🥛',
    products: [
    products: [
      { id: 1, name: 'Milk', image: '🥛', description: 'Fresh milk' },
      { id: 1, name: 'Milk', image: '🥛', description: 'Fresh milk from dairy farmers' },
      { id: 2, name: 'Cheese', image: '🧀', description: 'Various cheese types' },
      { id: 2, name: 'Curd', image: '🍶', description: 'Farm curd for local supply' },
      { id: 3, name: 'Yogurt', image: '🍶', description: 'Fresh yogurt' },
      { id: 3, name: 'Paneer', image: '🧀', description: 'Fresh paneer blocks' },
      { id: 4, name: 'Ghee', image: '🫙', description: 'Cow and buffalo ghee' },
      { id: 5, name: 'Butter', image: '🧈', description: 'Fresh white/yellow butter' },
      { id: 6, name: 'Eggs', image: '🥚', description: 'Poultry farm egg trays' },
      { id: 7, name: 'Honey', image: '🍯', description: 'Natural honey from beekeepers' },
    ]
  },
  {
    id: 9,
    name: 'Flowers & Horticulture',
    icon: '🌸',
    products: [
      { id: 1, name: 'Marigold', image: '🌼', description: 'Festival marigold flowers' },
      { id: 2, name: 'Rose', image: '🌹', description: 'Loose rose petals and stems' },
      { id: 3, name: 'Jasmine', image: '🌸', description: 'Fresh jasmine strings and flowers' },
      { id: 4, name: 'Chrysanthemum', image: '🌼', description: 'Decorative flower bundles' },
      { id: 5, name: 'Banana Leaf', image: '🍃', description: 'Leaves for catering and rituals' },
      { id: 6, name: 'Nursery Plants', image: '🪴', description: 'Vegetable and fruit saplings' },
    ]
    ]
  }
  }
];
];


function DealerDashboard() {
function DealerDashboard() {
  const navigate = useNavigate();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState({
    myOpenRequests: 0,
    activeOrders: 0,
    chats: 0,
  });

  useEffect(() => {
    const loadDealerDashboard = async () => {
      const user = getCurrentUser();
      if (user.role && user.role !== 'dealer') {
        navigate('/login');
        return;
      }

      try {
        const [requests, orders, chats] = await Promise.all([
          fetchRequests(),
          fetchMyOrders(),
          fetchMyChats(),
        ]);

        const myOpenRequests = Array.isArray(requests)
          ? requests.filter((r) => String(r?.dealerId || '') === String(user.userId || '') && (r?.status || 'open') === 'open').length
          : 0;

        const activeOrders = Array.isArray(orders)
          ? orders.filter((o) => !['delivered', 'cancelled'].includes(o?.status)).length
          : 0;

        const chatCount = Array.isArray(chats) ? chats.length : 0;

        setStats({
          myOpenRequests,
          activeOrders,
          chats: chatCount,
        });
      } catch (error) {
        console.error('Failed to load dealer dashboard stats', error);
      }
    };

    loadDealerDashboard();
  }, [navigate]);


  const filteredCategories = categories.filter(category =>
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.products.some(product =>
    category.products.some(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    )
  );
  );


  return (
  return (
    <div className="min-h-screen bg-gray-50">
    <div className="min-h-screen bg-gray-50">


      {/* HEADER */}
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:justify-between gap-3">


          {/* LEFT */}
          {/* LEFT */}
          <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-green-800">
              <h1 className="text-xl sm:text-2xl font-bold text-green-800">
                AGROFARM
                AGROFARM
              </h1>
              </h1>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Dealer
                Dealer
              </span>
              </span>
            </div>
            </div>
@@ -162,50 +297,65 @@ function DealerDashboard() {
                </button>
                </button>


                <button
                <button
                  title="Logout"
                  title="Logout"
                  onClick={() => {
                  onClick={() => {
                    setShowMenu(false);
                    setShowMenu(false);
                    navigate('/login');
                    navigate('/login');
                  }}
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                >
                >
                  🚪 Logout
                  🚪 Logout
                </button>
                </button>
              </div>
              </div>
            )}
            )}
          </div>
          </div>
        </div>
        </div>
      </header>
      </header>


      {/* MAIN */}
      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6">
      <main className="max-w-7xl mx-auto px-4 py-6">


        <h2 className="text-2xl font-bold mb-6">
        <h2 className="text-2xl font-bold mb-6">
          Welcome back 👋
          Welcome back 👋
        </h2>
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">My Open Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.myOpenRequests}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">My Active Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">My Chats</p>
            <p className="text-2xl font-bold text-gray-900">{stats.chats}</p>
          </div>
        </div>

        {/* PRICE PREDICTION */}
        {/* PRICE PREDICTION */}
        <div className="mb-8">
        <div className="mb-8">
          <button
          <button
            onClick={() => navigate('/dealer/price-prediction')}
            onClick={() => navigate('/dealer/price-prediction')}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
          >
          >
            💰 Price Prediction
            💰 Price Prediction
          </button>
          </button>
        </div>
        </div>


        {/* CATEGORIES */}
        {/* CATEGORIES */}
        {filteredCategories.map(category => (
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div key={category.id} className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">
            <h3 className="text-lg font-semibold mb-4">
              {category.icon} {category.name}
              {category.icon} {category.name}
            </h3>
            </h3>


            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.products.map(product => (
              {category.products.map(product => (
                <div
                <div
                  key={product.id}
                  key={product.id}
                  onClick={() => {
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedProduct(product);
                    setShowRequestForm(true);
                    setShowRequestForm(true);
                  }}
                  }}