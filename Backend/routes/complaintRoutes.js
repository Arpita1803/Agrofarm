import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createComplaint,
  bulkUpdateComplaintsByAdmin,
  exportComplaintsCsvForAdmin,
  addComplaintMessage,
  getComplaintMetricsForAdmin,
  getComplaintMessages,
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
router.get("/:id/messages", authMiddleware, getComplaintMessages);
router.post("/:id/messages", authMiddleware, addComplaintMessage);
router.patch("/admin/:id", authMiddleware, updateComplaintByAdmin);

export default router;