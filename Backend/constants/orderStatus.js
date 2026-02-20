export const ORDER_STATUSES = [
  "placed",
  "packed",
  "ready_for_delivery",
  "shipped",
  "out_for_delivery",
  "out_for_pickup",
  "picked",
  "delivered",
  "cancelled",
];

export const FARMER_CANCELLABLE_STATUSES = ["placed", "packed"];

export const ORDER_STATUS_FLOW_BY_DELIVERY_MODE = {
  farmer_delivery: ["placed", "packed", "ready_for_delivery", "shipped", "out_for_delivery", "delivered"],
  dealer_pickup: ["placed", "packed", "out_for_pickup", "picked", "delivered"],
  third_party: ["placed", "packed", "ready_for_delivery", "shipped", "out_for_delivery", "delivered"],
  meet_point: ["placed", "packed", "ready_for_delivery", "delivered"],
};
