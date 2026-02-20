import mongoose from "mongoose";
import Order from "../models/Order.js";
import { FARMER_CANCELLABLE_STATUSES, ORDER_STATUSES } from "../constants/orderStatus.js";

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    if (!ORDER_STATUSES.includes(status)) {
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

    if (status === order.status) {
      return res.status(400).json({ message: "Order is already in this status" });
    }

    if (isFarmer) {
      if (status !== "cancelled") {
        return res.status(403).json({ message: "Farmer can only cancel orders" });
      }
      if (!FARMER_CANCELLABLE_STATUSES.includes(order.status)) {
        return res.status(400).json({ message: "Order can no longer be cancelled" });
      }
    }

    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      updatedByRole: req.user.role,
      updatedAt: new Date(),
    });
    await order.save();

    return res.json({ message: "Order status updated", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
