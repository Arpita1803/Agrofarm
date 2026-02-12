import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createRequest, getOpenRequests, acceptRequest } from "../controllers/requestController.js";

const router = express.Router();

// Farmer fetches dealer requests
router.get("/", getOpenRequests);

// Dealer creates request
router.post("/", authMiddleware, createRequest);

// Farmer accepts request and creates order
router.post("/:id/accept", authMiddleware, acceptRequest);

export default router;
