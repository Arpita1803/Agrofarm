import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllMsp, upsertMsp } from "../../services/mspApi";
import { getCurrentUser } from "../../utils/roleGuard";

function AdminMspPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ product: "", price: "" });
  const [mspList, setMspList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMspList = async () => {
    try {
      const data = await fetchAllMsp();
      setMspList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load MSP list", error);
      setMspList([]);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user.role !== "admin") {
      navigate("/login");
      return;
    }

    loadMspList();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await upsertMsp({ product: formData.product, price: Number(formData.price) });
      setFormData({ product: "", price: "" });
      await loadMspList();
      alert("MSP saved");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save MSP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin MSP Management</h1>
          <button onClick={() => navigate("/")} className="px-3 py-2 border rounded-lg">Home</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border space-y-3">
          <h2 className="font-semibold">Set MSP</h2>
          <input
            type="text"
            placeholder="Product name (e.g., tomato)"
            value={formData.product}
            onChange={(e) => setFormData((prev) => ({ ...prev, product: e.target.value }))}
            className="w-full border rounded-lg p-2"
            required
          />
          <input
            type="number"
            placeholder="MSP price"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            className="w-full border rounded-lg p-2"
            required
            min="0"
          />
          <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            {loading ? "Saving..." : "Save MSP"}
          </button>
        </form>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="font-semibold mb-3">Configured MSP</h2>
          <div className="space-y-2">
            {mspList.map((item) => (
              <div key={item._id} className="flex justify-between border-b pb-2 text-sm">
                <span className="capitalize">{item.product}</span>
                <span className="font-medium">₹{item.price}</span>
              </div>
            ))}
            {mspList.length === 0 && <p className="text-gray-500 text-sm">No MSP entries yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMspPage;
