import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import landingImage from '../assets/images/landing_page/landing_page_1.jpg';

function LandingPage() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setShowRoleModal(false);
    navigate('/register', { state: { selectedRole: role } });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:p-6">
        <div className="text-2xl md:text-3xl font-bold text-green-800">AGROTECH</div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowRoleModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Get Started
          </button>
          <button 
            onClick={handleLogin}
            className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition duration-300"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Farm-to-Dealer
              <span className="block text-green-600 mt-2">Marketplace</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Connect farmers with dealers for seamless agricultural product trading. 
              Buy and sell fresh produce directly from farm to market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setShowRoleModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium transition duration-300 shadow-lg transform hover:scale-105"
              >
                Get Started Now
              </button>
              <button className="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-medium transition duration-300">
                Learn More
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-green-200 transform rotate-2 hover:rotate-0 transition duration-500">
                <img 
                  src={landingImage} 
                  alt="Farm fresh produce" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-400 rounded-full opacity-70"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full opacity-70"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose Agrotech?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature cards remain same as before */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Trading</h3>
              <p className="text-gray-600">Verified farmers and dealers with secure payment options</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Transactions</h3>
              <p className="text-gray-600">Quick and efficient trading process for fresh produce</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Direct Connection</h3>
              <p className="text-gray-600">Connect directly with farmers and dealers without middlemen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Join Agrotech</h2>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-gray-700 transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Choose how you want to join our platform:</p>
            
            <div className="space-y-4 mb-6">
              <div 
                onClick={() => handleRoleSelect('farmer')}
                className="border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">🌾</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">FARMER</h3>
                    <p className="text-sm text-gray-600">I want to sell my agricultural products</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleRoleSelect('dealer')}
                className="border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">🏪</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">DEALER</h3>
                    <p className="text-sm text-gray-600">I want to buy agricultural products</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleRoleSelect('authority')}
                className="border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">🏛️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">AUTHORITY</h3>
                    <p className="text-sm text-gray-600">Government/Monitoring body</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={handleLogin}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg transition duration-300"
              >
                Login
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition duration-300 opacity-50 cursor-not-allowed">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">AGROTECH</div>
          <p className="text-green-200 mb-4">Connecting Farmers and Dealers Seamlessly</p>
          <div className="text-green-300">
            <p>© 2024 Agrotech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;