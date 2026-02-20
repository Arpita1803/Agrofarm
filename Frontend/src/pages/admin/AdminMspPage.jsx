import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllMsp, fetchMspCatalog, upsertMsp } from "../../services/mspApi";
import { getCurrentUser } from "../../utils/roleGuard";

function AdminMspPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [mspList, setMspList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ product: "", price: "" });

  const loadData = async () => {
    try {
      const [catalogData, mspData] = await Promise.all([fetchMspCatalog(), fetchAllMsp()]);
      setCatalog(Array.isArray(catalogData) ? catalogData : []);
      setMspList(Array.isArray(mspData) ? mspData : []);
      if (!formData.product && Array.isArray(catalogData) && catalogData.length > 0) {
        setFormData((prev) => ({ ...prev, product: catalogData[0].product }));
      }
    } catch (error) {
      console.error("Failed to load MSP data", error);
      setCatalog([]);
      setMspList([]);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const mspByProduct = useMemo(() => {
    const map = new Map();
    mspList.forEach((item) => map.set(item.product, item));
    return map;
  }, [mspList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await upsertMsp({ product: formData.product, price: Number(formData.price) });
      setFormData((prev) => ({ ...prev, price: "" }));
      await loadData();
      alert("MSP updated successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update MSP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">MSP Management (23 Crops)</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="px-3 py-2 border rounded-lg">Back to Dashboard</button>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Update MSP Value</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={formData.product}
              onChange={(e) => setFormData((prev) => ({ ...prev, product: e.target.value }))}
              className="border rounded-lg p-2"
              required
            >
              {catalog.map((item) => (
                <option key={item.product} value={item.product}>
                  {item.product}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="New MSP value"
              className="border rounded-lg p-2"
              required
            />
            <button disabled={loading} className="bg-green-600 text-white rounded-lg px-4 py-2 disabled:opacity-50">
              {loading ? "Saving..." : "Save MSP"}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((crop) => {
            const live = mspByProduct.get(crop.product);
            const price = live?.price ?? crop.price;
            const updatedAt = live?.updatedAt ? new Date(live.updatedAt).toLocaleString("en-IN") : "Default value";
            return (
              <div key={crop.product} className="bg-white border rounded-xl p-4 shadow-sm">
                <p className="font-semibold capitalize">{crop.product}</p>
                <p className="text-2xl font-bold text-green-700 mt-2">₹{price}</p>
                <p className="text-xs text-gray-500 mt-2">Last updated: {updatedAt}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminMspPage;