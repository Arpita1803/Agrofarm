import { useState } from "react";

function DealerPriceRecommendation() {
  const [formData, setFormData] = useState({ crop: "", district: "", month: "" });
  const [price, setPrice] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPrice(null);
    setMeta(null);
    setLoading(true);

    try {
      const payload = {
        crop: formData.crop.trim(),
        district: formData.district.trim(),
        month: Number(formData.month),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Price Prediction</h2>
          <p className="text-sm text-gray-600 mt-1">Estimate mandi price by crop, district and month.</p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <input type="text" name="crop" placeholder="e.g. Wheat" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input type="text" name="district" placeholder="e.g. Pune" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input type="number" min="1" max="12" name="month" placeholder="1 - 12" onChange={handleChange} required className="w-full border p-3 rounded-lg" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? "Predicting..." : "Get Recommended Price"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Prediction Result</h3>
            <p className="text-sm text-gray-600">Your latest recommendation appears here.</p>
          </div>

          {price !== null ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800">Estimated Price</p>
                <p className="text-3xl font-bold text-green-700">₹ {price}</p>
                <p className="text-xs text-green-700">per Quintal</p>
              </div>
              {meta && (
                <div className="text-sm text-gray-700 space-y-1">
                  <p><b>Target Year:</b> {meta.targetYear}</p>
                  <p><b>Data Source:</b> {meta.sourceLevel}</p>
                  <p><b>Samples Used:</b> {meta.sampleSize}</p>
                  <p><b>Unit:</b> {meta.unit}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed p-6 text-center text-gray-500">
              Enter details and click “Get Recommended Price”.
            </div>
          )}

          {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default DealerPriceRecommendation;
