import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";

const generateTrackingId = () => `CMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const SLA_HOURS_BY_PRIORITY = { low: 120, medium: 72, high: 24 };
const getDueDateForPriority = (priority) => new Date(Date.now() + (SLA_HOURS_BY_PRIORITY[priority] || SLA_HOURS_BY_PRIORITY.medium) * 60 * 60 * 1000);

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
      trackingId: generateTrackingId(),
      raisedByUserId: req.user.id,
      raisedByRole: req.user.role,
      type,
      orderId: validatedOrderId,
      title,
      description,
      status: "open",
      dueAt: getDueDateForPriority("medium"),
      escalated: false,
      escalationLevel: 0,
      history: [
        {
          status: "open",
          priority: "medium",
          note: "Complaint created",
          changedByRole: req.user.role,
          changedByUserId: req.user.id,
          changedAt: new Date(),
        },
      ],
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

    const complaints = await Complaint.find({ raisedByUserId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("orderId", "product status dealerName farmerName");
    const now = Date.now();
    const mapped = complaints.map((c) => ({
      ...c.toObject(),
      isOverdue: c.dueAt ? new Date(c.dueAt).getTime() < now && !["resolved", "rejected"].includes(c.status) : false,
    }));
    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllComplaintsForAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access complaints" });
    }

    const { status = "all", type = "all", priority = "all", q = "" } = req.query;
    const filters = {};
    if (["open", "in_progress", "resolved", "rejected"].includes(status)) filters.status = status;
    if (["order_related", "website_related"].includes(type)) filters.type = type;
    if (["low", "medium", "high"].includes(priority)) filters.priority = priority;
    if (q && String(q).trim()) {
      filters.$or = [
        { trackingId: { $regex: String(q).trim(), $options: "i" } },
        { title: { $regex: String(q).trim(), $options: "i" } },
        { description: { $regex: String(q).trim(), $options: "i" } },
      ];
    }

    const complaints = await Complaint.find(filters)
      .sort({ createdAt: -1 })
      .populate("raisedByUserId", "name email role")
      .populate("orderId", "product dealerName farmerName status");
    const now = Date.now();
    const mapped = complaints.map((c) => ({
      ...c.toObject(),
      isOverdue: c.dueAt ? new Date(c.dueAt).getTime() < now && !["resolved", "rejected"].includes(c.status) : false,
    }));

    return res.json(mapped);
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

    let changed = false;

    if (status) {
      if (!["open", "in_progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      if (complaint.status !== status) changed = true;
      complaint.status = status;
    }

    if (priority) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority" });
      }
      if (complaint.priority !== priority) changed = true;
      complaint.priority = priority;
      if (!["resolved", "rejected"].includes(complaint.status)) {
        complaint.dueAt = getDueDateForPriority(priority);
      }
    }

    if (adminNote !== undefined) {
      if (String(complaint.adminNote || "") !== String(adminNote || "")) changed = true;
      complaint.adminNote = String(adminNote || "");
    }

    if (changed) {
      complaint.history = Array.isArray(complaint.history) ? complaint.history : [];
      complaint.history.push({
        status: complaint.status,
        priority: complaint.priority,
        note: complaint.adminNote || "Updated by admin",
        changedByRole: "admin",
        changedByUserId: req.user.id,
        changedAt: new Date(),
      });
    }

    const now = Date.now();
    const overdue = complaint.dueAt ? new Date(complaint.dueAt).getTime() < now : false;
    complaint.escalated = overdue && !["resolved", "rejected"].includes(complaint.status);
    complaint.escalationLevel = complaint.escalated ? Math.min((complaint.escalationLevel || 0) + 1, 3) : 0;

    await complaint.save();
    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getComplaintMetricsForAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access complaint metrics" });
    }

    const now = new Date();
    const [open, inProgress, resolved, rejected, escalated, overdue] = await Promise.all([
      Complaint.countDocuments({ status: "open" }),
      Complaint.countDocuments({ status: "in_progress" }),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({ status: "rejected" }),
      Complaint.countDocuments({ escalated: true }),
      Complaint.countDocuments({
        status: { $in: ["open", "in_progress"] },
        dueAt: { $lt: now },
      }),
    ]);

    return res.json({ open, inProgress, resolved, rejected, escalated, overdue });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
