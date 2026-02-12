import express from "express";
import Ad from "../models/Ad.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create ad (farmer only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can create ads" });
    }

    const { product, quantity, price, location } = req.body;

    if (!product || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: "product, quantity and price are required" });
    }

    const ad = await Ad.create({
      farmerId: req.user.id,
      product,
      quantity: Number(quantity),
      price: Number(price),
      location: location || "India",
    });

    return res.status(201).json(ad);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// List ads
router.get("/", async (_req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    return res.json(ads);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;