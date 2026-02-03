import React, { useState } from 'react';
import { createRequest } from '../../services/requestApi';

function RequestForm({ product, onClose }) {
  const [formData, setFormData] = useState({
    quantity: '',
    priceRange: { min: '', max: '' },
    variety: '',
    requiredDate: '',
    mobile: '',
    email: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const varieties = {
    Apple: ['Red Delicious', 'Granny Smith', 'Gala', 'Fuji', 'Honeycrisp'],
    Orange: ['Navel', 'Valencia', 'Blood Orange', 'Clementine'],
    Tomato: ['Roma', 'Cherry', 'Beefsteak', 'Heirloom'],
    Potato: ['Russet', 'Red', 'Yukon Gold', 'Sweet Potato'],
    Rice: ['Basmati', 'Jasmine', 'Brown', 'White'],
    Wheat: ['Whole', 'Refined'],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'minPrice' || name === 'maxPrice') {
      setFormData(prev => ({
        ...prev,
        priceRange: {
          ...prev.priceRange,
          [name === 'minPrice' ? 'min' : 'max']: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = 'Valid quantity required';

    if (!formData.priceRange.min || !formData.priceRange.max)
      newErrors.priceRange = 'Price range required';

    if (!formData.requiredDate)
      newErrors.requiredDate = 'Required date needed';

    if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = 'Valid 10-digit mobile required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("POST REQUEST CLICKED", formData);
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createRequest({
        product: product.name,
        quantity: formData.quantity,
        priceExpected: `${formData.priceRange.min}-${formData.priceRange.max}`,
        location: 'India',
        description: formData.notes,
      });

      if (res._id) {
        alert('Request posted successfully');
        onClose();
      } else {
        alert('Failed to post request');
      }
    } catch (error) {
      alert('Error posting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {product.image} {product.name} Request
          </h2>

          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity (kg)"
            className="w-full px-4 py-2 border rounded"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min price"
              onChange={(e) => handleChange({ ...e, name: 'minPrice' })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Max price"
              onChange={(e) => handleChange({ ...e, name: 'maxPrice' })}
              className="border p-2 rounded"
            />
          </div>

          <input
            type="date"
            name="requiredDate"
            min={getTomorrowDate()}
            value={formData.requiredDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />

          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile number"
            className="w-full px-4 py-2 border rounded"
          />

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes"
            className="w-full px-4 py-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? 'Posting...' : 'Post Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestForm;
