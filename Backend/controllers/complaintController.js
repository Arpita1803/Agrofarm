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
      messages: [
        {
          senderRole: req.user.role,
          senderId: req.user.id,
          message: String(description),
          isInternal: false,
          createdAt: new Date(),
        },
      ],
      lastMessageAt: new Date(),
      lastUserMessageAt: req.user.role === "admin" ? null : new Date(),
      lastAdminMessageAt: req.user.role === "admin" ? new Date() : null,
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
      .populate("orderId", "product dealerName farmerName status")
      .populate("assignedAdminId", "name email");
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
    const { status, priority, adminNote, assignToMe, rejectionReason } = req.body;

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
      if (status === "resolved") {
        complaint.resolvedAt = new Date();
        complaint.rejectionReason = "";
      }
      if (status === "rejected") {
        if (!String(rejectionReason || "").trim()) {
          return res.status(400).json({ message: "rejectionReason is required when rejecting a complaint" });
        }
        complaint.resolvedAt = new Date();
        complaint.rejectionReason = String(rejectionReason).trim();
      }
      if (!["resolved", "rejected"].includes(status)) {
        complaint.resolvedAt = null;
        complaint.rejectionReason = "";
      }
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

    if (assignToMe === true) {
      if (String(complaint.assignedAdminId || "") !== String(req.user.id)) changed = true;
      complaint.assignedAdminId = req.user.id;
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
    const [open, inProgress, resolved, rejected, escalated, overdue, lowPriority, mediumPriority, highPriority, resolvedRecords, activeComplaints] = await Promise.all([
      Complaint.countDocuments({ status: "open" }),
      Complaint.countDocuments({ status: "in_progress" }),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({ status: "rejected" }),
      Complaint.countDocuments({ escalated: true }),
      Complaint.countDocuments({
        status: { $in: ["open", "in_progress"] },
        dueAt: { $lt: now },
      }),
      Complaint.countDocuments({ priority: "low" }),
      Complaint.countDocuments({ priority: "medium" }),
      Complaint.countDocuments({ priority: "high" }),
      Complaint.find({ resolvedAt: { $ne: null } }).select("createdAt resolvedAt").limit(500),
      Complaint.find({ status: { $in: ["open", "in_progress"] } }).select("lastUserMessageAt lastAdminMessageAt"),
    ]);

    const waitingOnAdmin = activeComplaints.filter((c) => {
      const userTs = c.lastUserMessageAt ? new Date(c.lastUserMessageAt).getTime() : 0;
      const adminTs = c.lastAdminMessageAt ? new Date(c.lastAdminMessageAt).getTime() : 0;
      return userTs > adminTs;
    }).length;

    const waitingOnUser = activeComplaints.filter((c) => {
      const userTs = c.lastUserMessageAt ? new Date(c.lastUserMessageAt).getTime() : 0;
      const adminTs = c.lastAdminMessageAt ? new Date(c.lastAdminMessageAt).getTime() : 0;
      return adminTs > userTs;
    }).length;
    const resolutionHours = resolvedRecords
      .map((r) => (new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60))
      .filter((v) => Number.isFinite(v) && v >= 0);
    const avgResolutionHours = resolutionHours.length
      ? Number((resolutionHours.reduce((sum, h) => sum + h, 0) / resolutionHours.length).toFixed(2))
      : 0;

    return res.json({
      open,
      inProgress,
      resolved,
      rejected,
      escalated,
      overdue,
      byPriority: {
        low: lowPriority,
        medium: mediumPriority,
        high: highPriority,
      },
      avgResolutionHours,
      waitingOnAdmin,
      waitingOnUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const bulkUpdateComplaintsByAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can bulk update complaints" });
    }

    const { ids, status, priority, assignToMe = false, adminNote, rejectionReason } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids must be a non-empty array" });
    }

    if (status && !["open", "in_progress", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }
    if (status === "rejected" && !String(rejectionReason || "").trim()) {
      return res.status(400).json({ message: "rejectionReason is required when bulk rejecting complaints" });
    }

    const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const complaints = await Complaint.find({ _id: { $in: objectIds } });

    let updated = 0;
    for (const complaint of complaints) {
      let changed = false;

      if (status && complaint.status !== status) {
        complaint.status = status;
        changed = true;
      }

      if (priority && complaint.priority !== priority) {
        complaint.priority = priority;
        if (!["resolved", "rejected"].includes(complaint.status)) {
          complaint.dueAt = getDueDateForPriority(priority);
        }
        changed = true;
      }

      if (typeof adminNote !== "undefined" && String(complaint.adminNote || "") !== String(adminNote || "")) {
        complaint.adminNote = String(adminNote || "");
        changed = true;
      }

      if (assignToMe) {
        complaint.assignedAdminId = req.user.id;
        changed = true;
      }

      if (status === "resolved") {
        complaint.resolvedAt = new Date();
        complaint.rejectionReason = "";
      }
      if (status === "rejected") {
        complaint.resolvedAt = new Date();
        complaint.rejectionReason = String(rejectionReason || "").trim();
      }
      if (status && !["resolved", "rejected"].includes(status)) {
        complaint.resolvedAt = null;
        complaint.rejectionReason = "";
      }

      const now = Date.now();
      const overdue = complaint.dueAt ? new Date(complaint.dueAt).getTime() < now : false;
      complaint.escalated = overdue && !["resolved", "rejected"].includes(complaint.status);
      complaint.escalationLevel = complaint.escalated ? Math.min((complaint.escalationLevel || 0) + 1, 3) : 0;

      if (changed) {
        complaint.history = Array.isArray(complaint.history) ? complaint.history : [];
        complaint.history.push({
          status: complaint.status,
          priority: complaint.priority,
          note: complaint.adminNote || "Bulk updated by admin",
          changedByRole: "admin",
          changedByUserId: req.user.id,
          changedAt: new Date(),
        });
        await complaint.save();
        updated += 1;
      }
    }

    return res.json({ updated, requested: ids.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const exportComplaintsCsvForAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can export complaints" });
    }

    const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(2000).populate("raisedByUserId", "name email role").populate("assignedAdminId", "name email");
    const escapeCsv = (value) => {
      const str = String(value ?? "");
      return `"${str.replaceAll('"', '""')}"`;
    };

    const header = ["trackingId", "title", "type", "status", "priority", "raisedBy", "assignedAdmin", "dueAt", "resolvedAt", "escalated", "escalationLevel", "createdAt"];
    const rows = complaints.map((c) => [
      c.trackingId || "",
      c.title || "",
      c.type || "",
      c.status || "",
      c.priority || "",
      c?.raisedByUserId?.email || "",
      c?.assignedAdminId?.email || "",
      c.dueAt ? new Date(c.dueAt).toISOString() : "",
      c.resolvedAt ? new Date(c.resolvedAt).toISOString() : "",
      String(Boolean(c.escalated)),
      String(c.escalationLevel || 0),
      c.createdAt ? new Date(c.createdAt).toISOString() : "",
    ]);
    const csv = [header.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=complaints-${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getComplaintMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    const complaint = await Complaint.findById(id).populate("messages.senderId", "name email role");
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const canView = req.user.role === "admin" || String(complaint.raisedByUserId) === String(req.user.id);
    if (!canView) {
      return res.status(403).json({ message: "Not authorized to view complaint messages" });
    }

    const messages = Array.isArray(complaint.messages) ? complaint.messages : [];
    const visible = req.user.role === "admin" ? messages : messages.filter((m) => !m.isInternal);
    return res.json(visible);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addComplaintMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { message, isInternal = false } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }
    if (!String(message || "").trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = String(complaint.raisedByUserId) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not authorized to add complaint message" });
    }

    const internal = Boolean(isInternal) && isAdmin;
    complaint.messages = Array.isArray(complaint.messages) ? complaint.messages : [];
    complaint.messages.push({
      senderRole: req.user.role,
      senderId: req.user.id,
      message: String(message).trim(),
      isInternal: internal,
      createdAt: new Date(),
    });

    const now = new Date();
    complaint.lastMessageAt = now;
    if (req.user.role === "admin") {
      complaint.lastAdminMessageAt = now;
    } else {
      complaint.lastUserMessageAt = now;
    }

    await complaint.save();
    return res.status(201).json({ message: "Comment added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};