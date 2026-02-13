import React from 'react';
import { useNavigate } from 'react-router-dom';

function AuthorityDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-3">Authority Dashboard</h1>
        <p className="text-gray-700 mb-6">Phase 5A placeholder: basic authority panel route is ready.</p>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Next planned authority actions</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>View users and role summaries</li>
            <li>View request/order moderation metrics</li>
            <li>Review platform chat and activity stats</li>
          </ul>

          <button
            onClick={() => navigate('/')}
            className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthorityDashboard;
