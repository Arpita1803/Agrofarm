import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DealerDashboard from './pages/dealer/DealerDashboard'
import DealerCategory from './pages/dealer/DealerCategory'
import DealerOrders from './pages/dealer/DealerOrders'
import DealerChats from './pages/dealer/DealerChats'
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import FarmerOrders from './pages/farmer/FarmerOrders'
import FarmerProducts from './pages/farmer/FarmerProducts'
import FarmerChats from './pages/farmer/FarmerChats'
import ChatInterface from './pages/ChatInterface'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dealer Routes */}
        <Route path="/dealer/dashboard" element={<DealerDashboard />} />
        <Route path="/dealer/category/:categoryName" element={<DealerCategory />} />
        <Route path="/dealer/orders" element={<DealerOrders />} />
        <Route path="/dealer/chats" element={<DealerChats />} />
        
        {/* Farmer Routes */}
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/orders" element={<FarmerOrders />} />
        <Route path="/farmer/products" element={<FarmerProducts />} />
        <Route path="/farmer/chats" element={<FarmerChats />} />
        
        {/* Common Routes */}
        <Route path="/chat/:chatId" element={<ChatInterface />} />
      </Routes>
    </div>
  )
}

export default App 