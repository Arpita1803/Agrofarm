import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import landingImage from '../assets/images/landing_page/landing_page_1.jpg';

function LandingPage() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLearnMore = () => {
    const section = document.getElementById('why-agrofarm');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:p-6">
        <div className="text-2xl md:text-3xl font-bold text-green-800">
          AGROFARM
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleRegister}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            Register
          </button>
          <button 
            onClick={handleLogin}
            className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition duration-300"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Farm-to-Dealer
              <span className="block text-green-600 mt-2">
                Marketplace
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Connect farmers with dealers for seamless agricultural product trading. 
              Buy and sell fresh produce directly from farm to market.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            
              <button 
                onClick={handleLearnMore}
                className="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-medium transition duration-300"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Image */}
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
      <section id="why-agrofarm" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose Agrofarm?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                ✔
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Secure Trading
              </h3>
              <p className="text-gray-600">
                Verified farmers and dealers with secure payment options
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Fast Transactions
              </h3>
              <p className="text-gray-600">
                Quick and efficient trading process
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                🤝
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Direct Connection
              </h3>
              <p className="text-gray-600">
                No middlemen between farmers and dealers
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">AGROFARM</div>
          <p className="text-green-200 mb-4">
            Connecting Farmers and Dealers Seamlessly
          </p>
          <p className="text-green-300">
            © 2024 AgroFarm All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
