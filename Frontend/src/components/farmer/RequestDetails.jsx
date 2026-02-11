import React from "react";

function RequestDetails({ request, onClose, onStartChat }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const postedDate = request.createdAt || request.timestamp;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{request.productImage || request.image || "🌾"}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{request.product} Request</h2>
              <p className="text-sm text-gray-600">From {request.dealerName || request.dealer || "Dealer"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4 bg-green-50 rounded-lg p-4">
            <div className="text-6xl">{request.productImage || request.image || "🌾"}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{request.product}</h3>
              <p className="text-gray-600">{request.description || "Fresh produce request"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity Required:</span>
                  <span className="font-semibold">{request.quantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-semibold">₹{request.minPrice} - ₹{request.maxPrice} per kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Required Date:</span>
                  <span className="font-semibold">{formatDate(request.requiredDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-semibold">{request.location || "India"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dealer Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dealer Name:</span>
                  <span className="font-semibold">{request.dealerName || request.dealer || "Dealer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile Number:</span>
                  <span className="font-semibold">{request.mobile || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Request Posted:</span>
                  <span className="font-semibold">{formatDate(postedDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📝 Additional Information</h4>
            <p className="text-blue-800">{request.description || "Please discuss quality standards and delivery arrangements before proceeding."}</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Close
            </button>
            <button
              onClick={onStartChat}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition duration-300"
            >
              Start Chat with Dealer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestDetails;