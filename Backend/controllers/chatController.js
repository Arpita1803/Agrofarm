import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Request from "../models/Request.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const isParticipant = (chat, userId) =>
  String(chat.farmerId) === String(userId) || String(chat.dealerId) === String(userId);

const normalizeDeal = (deal) => ({
  finalQuantity: Number(deal.finalQuantity),
  pricePerKg: Number(deal.pricePerKg),
  deliveryDate: String(deal.deliveryDate || "").slice(0, 10),
  deliveryMode: String(deal.deliveryMode || ""),
  deliveryCost: Number(deal.deliveryCost || 0),
  meetingPlace: String(deal.meetingPlace || "").trim().toLowerCase(),
});

const isDealMatch = (dealA, dealB) => {
  const a = normalizeDeal(dealA);
  const b = normalizeDeal(dealB);

  return (
    a.finalQuantity === b.finalQuantity &&
    a.pricePerKg === b.pricePerKg &&
    a.deliveryDate === b.deliveryDate &&
    a.deliveryMode === b.deliveryMode &&
    a.deliveryCost === b.deliveryCost &&
    a.meetingPlace === b.meetingPlace
  );
};

export const createOrGetChat = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { requestId, orderId, otherUserId } = req.body;

    if (!otherUserId || (!requestId && !orderId)) {
      return res.status(400).json({ message: "otherUserId and either requestId or orderId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid otherUserId" });
    }

    if (requestId && !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid requestId" });
    }

    if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    let farmerId;
    let dealerId;

    if (req.user.role === "farmer") {
      farmerId = req.user.id;
      dealerId = otherUserId;
    } else if (req.user.role === "dealer") {
      farmerId = otherUserId;
      dealerId = req.user.id;
    } else {
      return res.status(403).json({ message: "Only farmer/dealer chats are supported" });
    }

    if (requestId) {
      const request = await Request.findById(requestId).select("dealerId");
      if (!request) return res.status(404).json({ message: "Request not found" });
      if (String(request.dealerId) !== String(dealerId)) {
        return res.status(403).json({ message: "Dealer mismatch for request" });
      }
    }

    if (orderId) {
      const order = await Order.findById(orderId).select("dealerId farmerId");
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (String(order.dealerId) !== String(dealerId) || String(order.farmerId) !== String(farmerId)) {
        return res.status(403).json({ message: "Participants mismatch for order" });
      }
    }

    let chat = await Chat.findOne({
      farmerId,
      dealerId,
      ...(requestId ? { requestId } : {}),
      ...(orderId ? { orderId } : {}),
    });

    if (!chat) {
      chat = await Chat.create({
        farmerId,
        dealerId,
        requestId,
        orderId,
        messages: [],
        dealSubmissions: [],
        lastMessageAt: new Date(),
      });
    }

    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyChats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query =
      req.user.role === "farmer"
        ? { farmerId: req.user.id }
        : req.user.role === "dealer"
          ? { dealerId: req.user.id }
          : null;

    if (!query) {
      return res.status(403).json({ message: "Only farmer/dealer chats are supported" });
    }

    const chats = await Chat.find(query)
      .populate("dealerId", "name")
      .populate("farmerId", "name")
      .populate("requestId", "product productImage")
      .populate("orderId", "product productImage")
      .sort({ lastMessageAt: -1 });

    const enriched = chats.map((chat) => {
      const lastMessage = chat?.messages?.[chat.messages.length - 1] || null;
      const product = chat?.requestId?.product || chat?.orderId?.product || "";
      const productImage = chat?.requestId?.productImage || chat?.orderId?.productImage || "🌾";

      const unreadCount =
        lastMessage && lastMessage?.senderRole && lastMessage.senderRole !== req.user.role ? 1 : 0;

      return {
        _id: chat._id,
        requestId: chat.requestId?._id || null,
        orderId: chat.orderId?._id || null,
        farmerId: chat.farmerId?._id || chat.farmerId || null,
        dealerId: chat.dealerId?._id || chat.dealerId || null,
        farmerName: chat.farmerId?.name || "Farmer",
        dealerName: chat.dealerId?.name || "Dealer",
        product,
        productImage,
        lastMessageText: lastMessage?.text || "",
        lastMessageAt: chat.lastMessageAt || lastMessage?.createdAt || chat.updatedAt,
        unreadCount,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    });

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!isParticipant(chat, req.user.id)) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    return res.json(chat.messages || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!isParticipant(chat, req.user.id)) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    chat.messages.push({
      senderId: req.user.id,
      senderRole: req.user.role,
      text: text.trim(),
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    const newMessage = chat.messages[chat.messages.length - 1];
    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitDeal = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!isParticipant(chat, req.user.id)) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    const submittedByRole = req.user.role;
    if (!["farmer", "dealer"].includes(submittedByRole)) {
      return res.status(403).json({ message: "Only farmer/dealer can submit deal" });
    }

    const { finalQuantity, pricePerKg, deliveryDate, deliveryMode, deliveryCost = 0, meetingPlace = "", notes = "" } =
      req.body || {};

    if (!finalQuantity || !pricePerKg || !deliveryDate || !deliveryMode || !meetingPlace) {
      return res.status(400).json({ message: "finalQuantity, pricePerKg, deliveryDate, deliveryMode, meetingPlace are required" });
    }

    const payload = {
      submittedByRole,
      finalQuantity: Number(finalQuantity),
      pricePerKg: Number(pricePerKg),
      deliveryDate: String(deliveryDate).slice(0, 10),
      deliveryMode,
      deliveryCost: Number(deliveryCost || 0),
      meetingPlace: String(meetingPlace).trim(),
      notes: String(notes || "").trim(),
    };

    chat.dealSubmissions = (chat.dealSubmissions || []).filter((item) => item.submittedByRole !== submittedByRole);
    chat.dealSubmissions.push(payload);
    await chat.save();

    const farmerDeal = chat.dealSubmissions.find((item) => item.submittedByRole === "farmer");
    const dealerDeal = chat.dealSubmissions.find((item) => item.submittedByRole === "dealer");

    if (!farmerDeal || !dealerDeal) {
      return res.json({
        matched: false,
        message: "Deal submitted. Waiting for the other side to submit.",
      });
    }

    if (!isDealMatch(farmerDeal, dealerDeal)) {
      return res.json({
        matched: false,
        message: "Deal data is not matching. Please negotiate again in chat.",
      });
    }

    const existingOrder = await Order.findOne({
      requestId: chat.requestId,
      dealerId: chat.dealerId,
      farmerId: chat.farmerId,
      status: { $ne: "cancelled" },
    });

    if (existingOrder) {
      return res.json({ matched: true, message: "Order already placed", order: existingOrder });
    }

    const request = await Request.findById(chat.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found for this chat" });
    }

    const farmer = await User.findById(chat.farmerId).select("name");

    const order = await Order.create({
      requestId: request._id,
      dealerId: chat.dealerId,
      dealerName: request.dealerName || "Dealer",
      farmerId: chat.farmerId,
      farmerName: farmer?.name || "Farmer",
      product: request.product,
      productImage: request.productImage || "🌾",
      quantity: payload.finalQuantity,
      agreedPrice: payload.pricePerKg,
      deliveryDate: payload.deliveryDate,
      deliveryMode: payload.deliveryMode,
      deliveryCost: payload.deliveryCost,
      meetingPlace: payload.meetingPlace,
      notes: payload.notes,
      status: "placed",
      statusHistory: [{ status: "placed", updatedByRole: submittedByRole, updatedAt: new Date() }],
    });

    request.status = "accepted";
    await request.save();

    chat.orderId = order._id;
    await chat.save();

    return res.json({
      matched: true,
      message: "Deal matched and order placed successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};