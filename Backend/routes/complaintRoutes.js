import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createComplaint,
  getAllComplaintsForAdmin,
  getMyComplaints,
  updateComplaintByAdmin,
} from "../controllers/complaintController.js";

const router = express.Router();

router.post("/", authMiddleware, createComplaint);
router.get("/my", authMiddleware, getMyComplaints);
router.get("/admin/all", authMiddleware, getAllComplaintsForAdmin);
router.patch("/admin/:id", authMiddleware, updateComplaintByAdmin);

export default router;
