import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAdminDashboard } from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, getAdminDashboard);

export default router;
