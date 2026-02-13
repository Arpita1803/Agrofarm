import { useState } from "react";

function DealerPriceRecommendation() {
  const [formData, setFormData] = useState({
    crop: "",
    district: "",
    month: "",
  });

  const [price, setPrice] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPrice(null);
    setMeta(null);

    try {
      const payload = {
        crop: formData.crop.trim(),
        district: formData.district.trim(),
        month: Number(formData.month), // important
      };

      const response = await fetch("http://localhost:5001/predict-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Prediction failed");
      } else {
        setPrice(data.predicted_price);
        setMeta({
          targetYear: data.target_year,
          sampleSize: data.sample_size,
          sourceLevel: data.source_level,
          unit: data.unit || "INR/quintal",
        });
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
          type="number"
          min="1"
          max="12"
          name="month"
          placeholder="Month number (1-12)"
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

      {price !== null && (
        <div className="mt-4">
          <p className="text-lg font-semibold text-green-700">
            ₹ {price} per Quintal
          </p>
          {meta && (
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p>Target Year: {meta.targetYear}</p>
              <p>Data Source: {meta.sourceLevel}</p>
              <p>Samples Used: {meta.sampleSize}</p>
              <p>Unit: {meta.unit}</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}

export default DealerPriceRecommendation;
