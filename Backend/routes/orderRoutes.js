import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/my", authMiddleware, getMyOrders);

export default router;