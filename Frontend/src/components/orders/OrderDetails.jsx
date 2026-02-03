import React, { useState } from 'react';

const statusSteps = [
  { id: 'ordered', label: 'Ordered', icon: '📝' },
  { id: 'accepted', label: 'Accepted', icon: '✅' },
  { id: 'processing', label: 'Processing', icon: '🔄' },
  { id: 'shipped', label: 'Shipped', icon: '🚚' },
  { id: 'delivered', label: 'Delivered', icon: '📦' }
];

const deliveryModes = {
  farmer_delivery: 'Farmer Delivery',
  dealer_pickup: 'Dealer Pickup',
  third_party: 'Third Party Logistics',
  meet_point: 'Meet Point'
};

function OrderDetails({ order, userRole, onClose, onTrack, onChat, onCancel, onAccept, onReject }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getCurrentStepIndex = () => {
    const stepOrder = ['ordered', 'accepted', 'processing', 'shipped', 'delivered'];
    return stepOrder.indexOf(order.status) + 1;
  };

  const currentStep = getCurrentStepIndex();

  const handleUpdateStatus = async (newStatus) => {
    if (window.confirm(`Update order status to ${newStatus}?`)) {
      setIsUpdating(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Order status updated to ${newStatus}`);
      setIsUpdating(false);
      onClose();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{order.image}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-600">{order.id} • {order.product}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Progress Timeline */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200"></div>
              <div 
                className="absolute left-0 top-5 h-1 bg-green-500 transition-all duration-500"
                style={{ width: `${order.progress}%` }}
              ></div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index + 1 <= currentStep;
                  const isCurrent = index + 1 === currentStep;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 z-10 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-white border-2 border-green-500 text-green-500'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-xs font-medium ${
                        isCompleted ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-xs text-green-600 mt-1 font-medium">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Status Info */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Delivery</p>
                <p className="font-medium">{formatDate(order.deliveryDate)}</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Order Info */}
            <div className="space-y-6">
              {/* Product Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product</span>
                    <span className="font-medium">{order.product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{order.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per kg</span>
                    <span className="font-medium">₹{order.pricePerKg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Total</span>
                    <span className="font-medium">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Mode</span>
                    <span className="font-medium">{deliveryModes[order.deliveryMode]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Cost</span>
                    <span className="font-medium">₹{order.deliveryCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meeting Place</span>
                    <span className="font-medium text-right">{order.meetingPlace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{order.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - User & Payment Info */}
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {userRole === 'farmer' ? 'Dealer Information' : 'Farmer Information'}
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userRole === 'farmer' ? 'D' : 'F'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {userRole === 'farmer' ? order.dealer : order.farmer}
                    </p>
                    <p className="text-sm text-gray-600">{order.location}</p>
                    {userRole === 'dealer' && order.farmerRating && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-600">{order.farmerRating}/5 Rating</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={onChat}
                  className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition duration-300"
                >
                  💬 Message {userRole === 'farmer' ? 'Dealer' : 'Farmer'}
                </button>
              </div>

              {/* Payment Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Amount</span>
                    <span className="font-medium">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Cost</span>
                    <span className="font-medium">₹{order.deliveryCost}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Grand Total</span>
                      <span className="text-xl font-bold text-green-700">₹{order.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : order.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Order Notes</h3>
              <p className="text-blue-800">{order.notes}</p>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-sm text-gray-500 text-center">
            Last updated: {new Date(order.lastUpdated).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onTrack}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-medium"
            >
              🚚 Track Order
            </button>
            
            <button
              onClick={onChat}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
            >
              💬 Chat
            </button>

            {/* Role-specific actions */}
            {userRole === 'farmer' && ['pending', 'accepted'].includes(order.status) && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium"
              >
                ❌ Cancel Order
              </button>
            )}

            {userRole === 'dealer' && order.status === 'pending' && (
              <>
                <button
                  onClick={onAccept}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-medium"
                >
                  ✅ Accept Order
                </button>
                <button
                  onClick={onReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 font-medium"
                >
                  ❌ Reject Order
                </button>
              </>
            )}

            {/* Status Update Actions (for testing) */}
            {userRole === 'dealer' && !['cancelled', 'delivered'].includes(order.status) && (
              <div className="flex-1"></div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;