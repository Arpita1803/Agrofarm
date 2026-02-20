import React, { useMemo, useState } from 'react';

const statusLabels = {
  placed: 'Placed',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  out_for_pickup: 'Out for Pickup',
  picked: 'Picked',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const flowByDeliveryMode = {
  farmer_delivery: ['placed', 'packed', 'ready_for_delivery', 'shipped', 'out_for_delivery', 'delivered'],
  dealer_pickup: ['placed', 'packed', 'out_for_pickup', 'picked', 'delivered'],
  third_party: ['placed', 'packed', 'ready_for_delivery', 'shipped', 'out_for_delivery', 'delivered'],
  meet_point: ['placed', 'packed', 'ready_for_delivery', 'delivered'],
};

function OrderDetails({ order, userRole, onClose, onTrack, onChat, onCancel, onAccept, onReject, onUpdateStatus }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusFlow = flowByDeliveryMode[order.deliveryMode] || flowByDeliveryMode.farmer_delivery;
  const currentStep = Math.max(statusFlow.indexOf(order.status), 0);

  const availableNextStatuses = useMemo(() => {
    if (order.status === 'cancelled' || order.status === 'delivered') return [];

    const next = statusFlow[currentStep + 1];
    if (!next) return [];

    // Farmer primarily updates movement statuses.
    if (userRole === 'farmer') return [next];

    // Dealer can only cancel before final or confirm delivered.
    if (userRole === 'dealer') {
      if (next === 'delivered') return ['delivered'];
      return [];
    }

    return [];
  }, [order.status, statusFlow, currentStep, userRole]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-IN');
  };

  const handleSubmitStatus = async () => {
    if (!selectedStatus || !onUpdateStatus) return;
    try {
      setIsUpdating(true);
      await onUpdateStatus(selectedStatus);
      setSelectedStatus('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{order.image}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-600">{order.id} • {order.product}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition duration-300">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="font-semibold">Current Status: {statusLabels[order.status] || order.status}</p>
            <p className="text-sm text-gray-600">Delivery Mode: {order.deliveryMode?.replace('_', ' ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFlow.map((step, index) => (
                <span key={step} className={`px-2 py-1 rounded text-xs ${index <= currentStep ? 'bg-green-200 text-green-900' : 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[step]}
                </span>
              ))}
            </div>
          </div>

          {order.statusHistory?.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Status Timeline</h3>
              <div className="space-y-2">
                {order.statusHistory.slice().reverse().map((item, idx) => (
                  <div key={`${item.status}-${idx}`} className="text-sm text-gray-700 flex justify-between">
                    <span>{statusLabels[item.status] || item.status} by {item.updatedByRole}</span>
                    <span className="text-gray-500">{formatDate(item.updatedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableNextStatuses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Update Order Status</h3>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                >
                  <option value="">Select next status</option>
                  {availableNextStatuses.map((st) => (
                    <option key={st} value={st}>{statusLabels[st]}</option>
                  ))}
                </select>
                <button
                  onClick={handleSubmitStatus}
                  disabled={!selectedStatus || isUpdating}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {isUpdating ? 'Submitting...' : 'Submit Status'}
                </button>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-3">
            <p><b>Quantity:</b> {order.quantity} kg</p>
            <p><b>Price:</b> ₹{order.pricePerKg}</p>
            <p><b>Delivery Date:</b> {order.deliveryDate}</p>
            <p><b>Meeting Place:</b> {order.meetingPlace}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={onTrack} className="px-4 py-2 bg-green-600 text-white rounded">Track</button>
            <button onClick={onChat} className="px-4 py-2 bg-blue-600 text-white rounded">Chat</button>
            {userRole === 'farmer' && ['placed', 'packed'].includes(order.status) && (
              <button onClick={onCancel} className="px-4 py-2 bg-red-600 text-white rounded">Cancel</button>
            )}
            <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
