import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createComplaint,
  bulkUpdateComplaintsByAdmin,
  exportComplaintsCsvForAdmin,
  getComplaintMetricsForAdmin,
  getAllComplaintsForAdmin,
  getMyComplaints,
  updateComplaintByAdmin,
} from "../controllers/complaintController.js";

const router = express.Router();

router.post("/", authMiddleware, createComplaint);
router.get("/my", authMiddleware, getMyComplaints);
router.get("/admin/all", authMiddleware, getAllComplaintsForAdmin);
router.get("/admin/metrics", authMiddleware, getComplaintMetricsForAdmin);
router.get("/admin/export", authMiddleware, exportComplaintsCsvForAdmin);
router.post("/admin/bulk-update", authMiddleware, bulkUpdateComplaintsByAdmin);
router.patch("/admin/:id", authMiddleware, updateComplaintByAdmin);

export default router;
