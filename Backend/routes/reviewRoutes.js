import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview,
  getMyGivenReviews,
  getMyReceivedReviews,
  getReviewsByOrder,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);
router.get("/order/:orderId", authMiddleware, getReviewsByOrder);
router.get("/my/given", authMiddleware, getMyGivenReviews);
router.get("/my/received", authMiddleware, getMyReceivedReviews);

export default router;
