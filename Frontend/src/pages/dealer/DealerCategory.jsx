import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DealerCategory() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API
  const category = {
    name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
    icon: '🍎',
    products: [
      { id: 1, name: 'Product 1', image: '🍎', description: 'Description 1' },
      { id: 2, name: 'Product 2', image: '🍊', description: 'Description 2' },
      // ... more products
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dealer/dashboard')}
              className="mr-4 text-gray-600 hover:text-green-600 transition duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{category.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name} Category</h2>
          <p className="text-gray-600">Full category view coming soon...</p>
        </div>
      </main>
    </div>
  );
}

export default DealerCategory;