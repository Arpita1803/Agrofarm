import React, { useEffect, useMemo, useState } from "react";
import { createRequest } from "../../services/requestApi";
import { fetchMspByProduct, fetchMspCatalog } from "../../services/mspApi";

function RequestForm({ product, onClose }) {
  const [formData, setFormData] = useState({
    quantity: "",
    minPrice: "",
    maxPrice: "",
    requiredDate: "",
    mobile: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [mspInfo, setMspInfo] = useState({ loading: true, price: null, error: "", required: false });

  const normalizedProduct = useMemo(() => String(product.name || "").trim().toLowerCase(), [product.name]);

  useEffect(() => {
    const loadMsp = async () => {
      try {
        setMspInfo({ loading: true, price: null, error: "", required: false });
        const catalogData = await fetchMspCatalog();
        const allowed = Array.isArray(catalogData) ? catalogData.map((item) => item.product) : [];

        if (!allowed.includes(normalizedProduct)) {
          setMspInfo({ loading: false, price: null, error: "MSP not applicable for this product", required: false });
          return;
        }

        const data = await fetchMspByProduct(product.name);
        setMspInfo({ loading: false, price: Number(data?.price), error: "", required: true });
      } catch (error) {
        setMspInfo({
          loading: false,
          price: null,
          error: error?.response?.data?.message || "MSP not configured for this product",
          required: true,
        });
      }
    };

    loadMsp();
  }, [product.name, normalizedProduct]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const minPrice = Number(formData.minPrice);
    if (mspInfo.required && Number.isFinite(mspInfo.price) && minPrice <= mspInfo.price) {
      alert(`Min price must be greater than MSP (₹${mspInfo.price})`);
      return;
    }

    try {
      setLoading(true);

      await createRequest({
        product: product.name,
        productImage: product.image,
        quantity: Number(formData.quantity),
        minPrice,
        maxPrice: Number(formData.maxPrice),
        location: "India",
        requiredDate: formData.requiredDate || undefined,
        mobile: formData.mobile,
        description: formData.notes,
      });

      alert("Request posted successfully");
      onClose();
    } catch (error) {
      alert(error?.response?.data?.message || "Request failed. Check console.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Request for {product.name}</h2>
        <p className="text-sm text-gray-500">Set your buying range (per kg).</p>

        <div className="text-sm rounded-lg px-3 py-2 border bg-gray-50">
          {mspInfo.loading && <span className="text-gray-600">Loading MSP...</span>}
          {!mspInfo.loading && mspInfo.required && mspInfo.price !== null && (
            <span className="text-green-700 font-medium">MSP for {product.name}: ₹{mspInfo.price} (min price must be above this)</span>
          )}
          {!mspInfo.loading && mspInfo.required && mspInfo.price === null && (
            <span className="text-red-600">{mspInfo.error}</span>
          )}
          {!mspInfo.loading && !mspInfo.required && (
            <span className="text-gray-600">MSP catalog has 23 crops; this product is outside current MSP list.</span>
          )}
        </div>

        <input type="number" name="quantity" placeholder="Quantity (kg)" value={formData.quantity} onChange={handleChange} className="w-full border rounded-lg p-2" required />
        <input type="number" name="minPrice" placeholder="Min Price" value={formData.minPrice} onChange={handleChange} className="w-full border rounded-lg p-2" required />
        <input type="number" name="maxPrice" placeholder="Max Price" value={formData.maxPrice} onChange={handleChange} className="w-full border rounded-lg p-2" required />
        <input type="date" name="requiredDate" value={formData.requiredDate} onChange={handleChange} className="w-full border rounded-lg p-2" />
        <input type="text" name="mobile" placeholder="Mobile number" value={formData.mobile} onChange={handleChange} className="w-full border rounded-lg p-2" />
        <textarea name="notes" placeholder="Additional notes" value={formData.notes} onChange={handleChange} className="w-full border rounded-lg p-2" rows="3" />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button
            type="submit"
            disabled={loading || mspInfo.loading || (mspInfo.required && mspInfo.price === null)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestForm;
