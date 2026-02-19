import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createOrGetChat,
  getMyChats,
  getChatMessages,
  sendMessage,
  submitDeal,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", authMiddleware, createOrGetChat);
router.get("/my", authMiddleware, getMyChats);
router.get("/:chatId/messages", authMiddleware, getChatMessages);
router.post("/:chatId/messages", authMiddleware, sendMessage);
router.post("/:chatId/deal", authMiddleware, submitDeal);

export default router;