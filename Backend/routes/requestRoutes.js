import express from "express";
import Request from "../models/Request.js";

const router = express.Router();

// Farmer fetches dealer requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

export default router;
