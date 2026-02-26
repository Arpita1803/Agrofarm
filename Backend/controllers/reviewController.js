import mongoose from "mongoose";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

const COMPLETED_STATUSES = ["delivered", "picked"];

export const createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orderId, rating, reviewText, photoUrls } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Valid orderId is required" });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 10) {
      return res.status(400).json({ message: "rating must be a number between 0 and 10" });
    }

    const order = await Order.findById(orderId).select("dealerId farmerId status");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!COMPLETED_STATUSES.includes(order.status)) {
      return res.status(400).json({ message: "Review allowed only after delivery completion" });
    }

    const isDealer = String(order.dealerId) === String(req.user.id);
    const isFarmer = String(order.farmerId) === String(req.user.id);

    if (!isDealer && !isFarmer) {
      return res.status(403).json({ message: "Not authorized to review this order" });
    }

    const reviewerRole = isDealer ? "dealer" : "farmer";
    const revieweeRole = isDealer ? "farmer" : "dealer";
    const revieweeId = isDealer ? order.farmerId : order.dealerId;

    const safePhotos = Array.isArray(photoUrls)
      ? photoUrls.filter((p) => typeof p === "string" && p.trim()).slice(0, 3)
      : [];

    let review;
    try {
      review = await Review.create({
        orderId: order._id,
        reviewerId: req.user.id,
        reviewerRole,
        revieweeId,
        revieweeRole,
        rating: numericRating,
        reviewText: String(reviewText || ""),
        photoUrls: safePhotos,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: "You have already reviewed this order" });
      }
      throw error;
    }

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getReviewsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const reviews = await Review.find({ orderId })
      .sort({ createdAt: -1 })
      .populate("reviewerId", "name role")
      .populate("revieweeId", "name role");

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyGivenReviews = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const reviews = await Review.find({ reviewerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyReceivedReviews = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const reviews = await Review.find({ revieweeId: req.user.id }).sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
