import React, { useState } from "react";
import axios from "axios";

function ChangePasswordModal({ onClose }) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("New passwords do not match");
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/dealer/change-password",
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccess(res.data.message);
      setError("");
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Change Password</h3>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            required
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            required
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            required
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg"
            >
              Update
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
