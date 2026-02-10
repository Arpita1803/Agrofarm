import React, { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

function DealerProfile() {
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Later replace with real data from backend
  const dealer = {
    name: "Dealer Name",
    email: "dealer@example.com",
    phone: "9876543210",
    role: "Dealer",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          Dealer Profile
        </h2>

        <div className="space-y-3 text-sm">
          <p><strong>Name:</strong> {dealer.name}</p>
          <p><strong>Email:</strong> {dealer.email}</p>
          <p><strong>Phone:</strong> {dealer.phone}</p>
          <p><strong>Role:</strong> {dealer.role}</p>
        </div>

        <button
          onClick={() => setShowChangePassword(true)}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
        >
          🔒 Change Password
        </button>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
}

export default DealerProfile;
