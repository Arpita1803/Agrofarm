import express from "express";
import Ad from "../models/Ad.js";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import { sendSMS } from "../services/smsService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const ad = await Ad.create(req.body);

    // find all dealers
    const dealers = await User.find({ role: "dealer" });

    for (const dealer of dealers) {
      if (dealer.email) {
        await sendEmail(
          dealer.email,
          "New Farmer Advertisement 🌾",
          `Product: ${ad.product}\nQuantity: ${ad.quantity} kg\nPrice: ₹${ad.price}`
        );
      }

      if (dealer.phone) {
        await sendSMS(
          dealer.phone,
          `New farmer ad: ${ad.product}, ${ad.quantity}kg at ₹${ad.price}`
        );
      }
    }

    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ message: "Failed to create ad" });
  }
});

export default router;
