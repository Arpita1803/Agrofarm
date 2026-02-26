import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";

export const createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { type, orderId, title, description } = req.body;
    if (!type || !title || !description) {
      return res.status(400).json({ message: "type, title and description are required" });
    }

    if (!["order_related", "website_related"].includes(type)) {
      return res.status(400).json({ message: "Invalid complaint type" });
    }

    let validatedOrderId = null;
    if (type === "order_related") {
      if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "Valid orderId is required for order-related complaint" });
      }

      const order = await Order.findById(orderId).select("dealerId farmerId");
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const isParticipant =
        String(order.dealerId) === String(req.user.id) ||
        String(order.farmerId) === String(req.user.id) ||
        req.user.role === "admin";

      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized for this order complaint" });
      }

      validatedOrderId = order._id;
    }

    const complaint = await Complaint.create({
      raisedByUserId: req.user.id,
      raisedByRole: req.user.role,
      type,
      orderId: validatedOrderId,
      title,
      description,
      status: "open",
    });

    return res.status(201).json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const complaints = await Complaint.find({ raisedByUserId: req.user.id }).sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllComplaintsForAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access complaints" });
    }

    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate("raisedByUserId", "name email role")
      .populate("orderId", "product dealerName farmerName status");

    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateComplaintByAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update complaints" });
    }

    const { id } = req.params;
    const { status, priority, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (status) {
      if (!["open", "in_progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      complaint.status = status;
    }

    if (priority) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
      }
      complaint.priority = priority;
    }

    if (adminNote !== undefined) {
      complaint.adminNote = String(adminNote || "");
    }

    await complaint.save();
    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
