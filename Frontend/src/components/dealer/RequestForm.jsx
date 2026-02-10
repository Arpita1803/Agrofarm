import React, { useState } from "react";
import { createRequest } from "../../services/requestApi";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("POST REQUEST CLICKED", formData);

    try {
      setLoading(true);

      await createRequest({
        product: product.name,
        quantity: formData.quantity,
        priceExpected: `${formData.minPrice}-${formData.maxPrice}`,
        location: "India",
        description: formData.notes,
      });

      alert("Request posted successfully");
      onClose();
    } catch (error) {
      alert("Request failed. Check console.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-96 space-y-4"
      >
        <h2 className="text-xl font-bold">{product.name} Request</h2>

        <input
          name="quantity"
          placeholder="Quantity (kg)"
          onChange={handleChange}
          className="w-full border p-2"
          required
        />

        <div className="flex gap-2">
          <input
            name="minPrice"
            placeholder="Min Price"
            onChange={handleChange}
            className="w-full border p-2"
          />
          <input
            name="maxPrice"
            placeholder="Max Price"
            onChange={handleChange}
            className="w-full border p-2"
          />
        </div>

        <textarea
          name="notes"
          placeholder="Additional notes"
          onChange={handleChange}
          className="w-full border p-2"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 border p-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 bg-green-600 text-white p-2"
          >
            {loading ? "Posting..." : "Post Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestForm;
