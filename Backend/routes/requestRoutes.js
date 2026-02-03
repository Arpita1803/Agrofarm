import express from "express";
import { createRequest, getOpenRequests } from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRequest);      // Dealer
router.get("/", protect, getOpenRequests);     // Farmer

export default router;
