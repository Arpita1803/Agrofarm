import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.get("/my", authMiddleware, getMyOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

export default router;
export default router;
