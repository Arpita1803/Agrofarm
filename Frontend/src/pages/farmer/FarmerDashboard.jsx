import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRequests } from '../../services/requestApi';
import RequestDetails from '../../components/farmer/RequestDetails';
import LanguageSelection from '../../components/common/LanguageSelection';
// import Recommendation from "../../components/Recommendation/Recommendation";

function FarmerDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [requestToChat, setRequestToChat] = useState(null);

  useEffect(() => {
    fetchRequests().then(data => {
      if (Array.isArray(data)) setRequests(data);
    });
  }, []);

  const filteredRequests = requests.filter(req =>
    req.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const handleStartChat = (request) => {
    setRequestToChat(request);
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (language) => {
    setShowLanguageModal(false);
    navigate(`/chat/${requestToChat._id}`, {
      state: { request: requestToChat, userLanguage: language }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Available Requests 🌾</h1>

      {/* ✅ ADDED (ONLY THIS COMPONENT)
      <div className="mb-8">
        <Recommendation />
      </div> */}

      <input
        type="text"
        placeholder="Search requests..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full max-w-md"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRequests.map(request => (
          <div
            key={request._id}
            className="bg-white p-4 rounded shadow border"
          >
            <h3 className="font-bold text-lg">{request.product}</h3>
            <p className="text-sm">Quantity: {request.quantity} kg</p>
            <p className="text-sm">Price: {request.priceExpected}</p>
            <p className="text-sm">Location: {request.location}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleViewDetails(request)}
                className="flex-1 border px-3 py-1 rounded"
              >
                Details
              </button>
              <button
                onClick={() => handleStartChat(request)}
                className="flex-1 bg-green-600 text-white px-3 py-1 rounded"
              >
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {showRequestDetails && selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => setShowRequestDetails(false)}
          onStartChat={() => handleStartChat(selectedRequest)}
        />
      )}

      {showLanguageModal && (
        <LanguageSelection
          onClose={() => setShowLanguageModal(false)}
          onLanguageSelect={handleLanguageSelect}
        />
      )}
    </div>
  );
}

export default FarmerDashboard;
