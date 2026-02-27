import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createReview,
  getAdminReviews,
  getMyGivenReviews,
  getMyReceivedReviews,
  getReviewSummaryForUser,
  getReviewsByOrder,
  moderateReviewByAdmin,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);
router.get("/order/:orderId", authMiddleware, getReviewsByOrder);
router.get("/my/given", authMiddleware, getMyGivenReviews);
router.get("/my/received", authMiddleware, getMyReceivedReviews);
router.get("/my/summary", authMiddleware, getReviewSummaryForUser);
router.get("/summary/:userId", authMiddleware, getReviewSummaryForUser);
router.get("/admin/all", authMiddleware, getAdminReviews);
router.patch("/admin/:id", authMiddleware, moderateReviewByAdmin);

export default router;