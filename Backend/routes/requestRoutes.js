import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createRequest, getOpenRequests } from "../controllers/requestController.js";

const router = express.Router();

// Farmer fetches dealer requests
router.get("/", getOpenRequests);

// Dealer creates request
router.post("/", authMiddleware, createRequest);

export default router;