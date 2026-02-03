import React, { useState } from 'react';

function ProceedDealForm({ request, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    finalQuantity: request?.quantity || 0,
    pricePerKg: request?.priceRange?.min || 0,
    deliveryDate: '',
    deliveryMode: 'farmer_delivery',
    deliveryCost: 0,
    meetingPlace: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryModes = [
    { id: 'farmer_delivery', label: 'Farmer Delivery', description: 'I will deliver to dealer' },
    { id: 'dealer_pickup', label: 'Dealer Pickup', description: 'Dealer will collect from farm' },
    { id: 'third_party', label: 'Third Party Logistics', description: 'Use delivery service' },
    { id: 'meet_point', label: 'Meet Point', description: 'Meet at neutral location' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.finalQuantity || formData.finalQuantity <= 0) {
      newErrors.finalQuantity = 'Please enter a valid quantity';
    }

    if (!formData.pricePerKg || formData.pricePerKg <= 0) {
      newErrors.pricePerKg = 'Please enter a valid price';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Please select delivery date';
    }

    if (!formData.meetingPlace.trim()) {
      newErrors.meetingPlace = 'Please enter delivery/meeting place';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total
      const totalAmount = (formData.finalQuantity * formData.pricePerKg) + parseFloat(formData.deliveryCost || 0);

      const dealData = {
        ...formData,
        totalAmount,
        product: request?.product,
        dealer: request?.dealer,
        dealerMobile: request?.mobile,
        submittedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmit(dealData);
    } catch (error) {
      console.error('Error submitting deal:', error);
      setErrors({ submit: 'Failed to submit deal. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const calculateTotal = () => {
    const quantity = parseFloat(formData.finalQuantity) || 0;
    const price = parseFloat(formData.pricePerKg) || 0;
    const delivery = parseFloat(formData.deliveryCost) || 0;
    return (quantity * price) + delivery;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Proceed to Deal</h2>
            <p className="text-sm text-gray-600 mt-1">Finalize the terms with {request?.dealer}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Summary */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{request?.image || '🍅'}</span>
              <div>
                <h3 className="font-bold text-gray-900">{request?.product || 'Product'}</h3>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">Dealer:</span>
                    <span className="ml-2 font-medium">{request?.dealer}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Original Quantity:</span>
                    <span className="ml-2 font-medium">{request?.quantity} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price Range:</span>
                    <span className="ml-2 font-medium">₹{request?.priceRange?.min} - ₹{request?.priceRange?.max}/kg</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Required by:</span>
                    <span className="ml-2 font-medium">
                      {request?.requiredDate ? new Date(request.requiredDate).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Final Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Quantity (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="finalQuantity"
                    value={formData.finalQuantity}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.finalQuantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="1"
                    step="0.5"
                  />
                  <div className="absolute right-3 top-3 text-gray-500">kg</div>
                </div>
                {errors.finalQuantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.finalQuantity}</p>
                )}
              </div>

              {/* Price per kg */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per kg (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="pricePerKg"
                    value={formData.pricePerKg}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.pricePerKg ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute right-3 top-3 text-gray-500">₹/kg</div>
                </div>
                {errors.pricePerKg && (
                  <p className="mt-1 text-sm text-red-600">{errors.pricePerKg}</p>
                )}
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  min={getTomorrowDate()}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.deliveryDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.deliveryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Delivery Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Mode *
                </label>
                <div className="space-y-2">
                  {deliveryModes.map((mode) => (
                    <div
                      key={mode.id}
                      className={`border rounded-lg p-3 cursor-pointer transition duration-300 ${
                        formData.deliveryMode === mode.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, deliveryMode: mode.id }))}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                          formData.deliveryMode === mode.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-400'
                        }`}>
                          {formData.deliveryMode === mode.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{mode.label}</div>
                          <div className="text-xs text-gray-600">{mode.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Cost (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="deliveryCost"
                    value={formData.deliveryCost}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute right-3 top-3 text-gray-500">₹</div>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting/Delivery Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery/Meeting Place *
            </label>
            <textarea
              name="meetingPlace"
              value={formData.meetingPlace}
              onChange={handleChange}
              placeholder="Enter full address or meeting point details..."
              rows="2"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                errors.meetingPlace ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.meetingPlace && (
              <p className="mt-1 text-sm text-red-600">{errors.meetingPlace}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special instructions, quality requirements, or terms..."
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="mt-1 mr-3"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to supply the product as per agreed quality standards. I understand that the dealer must accept this deal for it to become binding.
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                id="cancellation"
                name="cancellation"
                className="mt-1 mr-3"
                required
              />
              <label htmlFor="cancellation" className="text-sm text-gray-700">
                I understand the cancellation policy: 24-hour notice required for order cancellation, subject to 10% cancellation fee.
              </label>
            </div>
          </div>

          {/* Total Calculation */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product Total</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{(formData.finalQuantity * formData.pricePerKg).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Cost</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{parseFloat(formData.deliveryCost || 0).toFixed(2)}
                </p>
              </div>
              <div className="col-span-2 border-t border-blue-200 pt-3">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">Grand Total</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Deal...
                </div>
              ) : (
                'Submit Deal to Dealer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProceedDealForm;