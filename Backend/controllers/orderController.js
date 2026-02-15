import Order from "../models/Order.js";

const statusTransitions = {
  placed: ["packed", "cancelled"],
  packed: ["ready_for_delivery", "out_for_pickup", "cancelled"],
  ready_for_delivery: ["shipped", "out_for_delivery", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  out_for_pickup: ["picked", "cancelled"],
  picked: ["delivered"],
  delivered: [],
  cancelled: [],
};

const farmerManagedStatuses = [
  "packed",
  "ready_for_delivery",
  "shipped",
  "out_for_delivery",
  "out_for_pickup",
  "picked",
  "delivered",
  "cancelled",
];

const dealerManagedStatuses = ["cancelled", "delivered"];

export const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let query = {};

    if (req.user.role === "farmer") {
      query = { farmerId: req.user.id };
    } else if (req.user.role === "dealer") {
      query = { dealerId: req.user.id };
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = Object.keys(statusTransitions);
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isDealer = req.user.role === "dealer" && String(order.dealerId) === String(req.user.id);
    const isFarmer = req.user.role === "farmer" && String(order.farmerId) === String(req.user.id);

    if (!isDealer && !isFarmer) {
      return res.status(403).json({ message: "Not authorized for this order" });
    }

    const allowedByRole = isFarmer ? farmerManagedStatuses : dealerManagedStatuses;
    if (!allowedByRole.includes(status)) {
      return res.status(403).json({ message: "You cannot set this status" });
    }

    if (order.deliveryMode === "farmer_delivery" && ["out_for_pickup", "picked"].includes(status)) {
      return res.status(400).json({ message: "Pickup statuses are not valid for farmer delivery" });
    }

    if (order.deliveryMode === "dealer_pickup" && ["ready_for_delivery", "shipped", "out_for_delivery"].includes(status)) {
      return res.status(400).json({ message: "Delivery statuses are not valid for dealer pickup" });
    }

    const possibleNextStatuses = statusTransitions[order.status] || [];
    if (!possibleNextStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid transition from ${order.status} to ${status}` });
    }

    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, updatedByRole: req.user.role, updatedAt: new Date() });

    await order.save();

    return res.json({ message: "Order status updated", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
