import { useState } from "react";

function DealerPriceRecommendation() {
  const [formData, setFormData] = useState({
    crop: "",
    district: "",
    month: "",
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
    } catch (err) {
      setError("Backend not running");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Price Recommendation</h2>

      <form onSubmit={handleSubmit}>
        <label>Crop Name</label>
        <input
          type="text"
          name="crop"
          placeholder="e.g. Wheat"
          onChange={handleChange}
          required
        />

        <label>District</label>
        <input
          type="text"
          name="district"
          placeholder="e.g. Pune"
          onChange={handleChange}
          required
        />

        <label>Month</label>
        <input
          type="text"
          name="month"
          placeholder="e.g. January"
          onChange={handleChange}
          required
        />

        <button type="submit">Get Price</button>
      </form>

      {price && (
        <div style={{ marginTop: "20px" }}>
          <h3>Recommended Selling Price</h3>
          <p><strong>₹ {price} per Quintal</strong></p>
        </div>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}
    </div>
  );
}

export default DealerPriceRecommendation;
