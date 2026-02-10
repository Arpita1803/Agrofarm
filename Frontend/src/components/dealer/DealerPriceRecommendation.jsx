import { useState } from "react";

function DealerPriceRecommendation() {
  const [formData, setFormData] = useState({
    crop: "",
    district: "",
    month: ""
  });

  const [price, setPrice] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPrice(null);

    try {
      const response = await fetch("http://localhost:5000/predict-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
      } else {
        setPrice(data.predicted_price);
      }
    } catch {
      setError("ML backend not running");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Price Prediction</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="crop"
          placeholder="Crop (e.g. Wheat)"
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="district"
          placeholder="District (e.g. Pune)"
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="month"
          placeholder="Month (e.g. January)"
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Get Price
        </button>
      </form>

      {price && (
        <p className="mt-4 text-lg font-semibold text-green-700">
          ₹ {price} per Quintal
        </p>
      )}

      {error && (
        <p className="mt-4 text-red-600">{error}</p>
      )}
    </div>
  );
}

export default DealerPriceRecommendation;
