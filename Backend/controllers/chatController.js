import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Request from "../models/Request.js";
import Order from "../models/Order.js";

const isParticipant = (chat, userId) =>
  String(chat.farmerId) === String(userId) || String(chat.dealerId) === String(userId);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

export const createOrGetChat = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { requestId, orderId, otherUserId } = req.body;

    if (!otherUserId || (!requestId && !orderId)) {
      return res.status(400).json({ message: "otherUserId and either requestId or orderId are required" });
    }

    if (!isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid otherUserId" });
    }

    if (requestId && !isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid requestId" });
    }

    if (orderId && !isValidObjectId(orderId)) {
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
        unreadCount: 0,
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