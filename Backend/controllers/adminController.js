import User from "../models/User.js";
import Ad from "../models/Ad.js";
import Order from "../models/Order.js";
import Complaint from "../models/Complaint.js";
import Review from "../models/Review.js";

export const getAdminDashboard = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access this resource" });
    }

    const [users, ads, orders, complaintCount, complaints, reviewCount, hiddenReviewCount] = await Promise.all([
      User.find().select("name email role createdAt").sort({ createdAt: -1 }),
      Ad.find().sort({ createdAt: -1 }).limit(100),
      Order.find().sort({ createdAt: -1 }).limit(100),
      Complaint.countDocuments(),
      Complaint.find().sort({ createdAt: -1 }).limit(50).populate("raisedByUserId", "name email role").populate("orderId", "product status"),
      Review.countDocuments(),
      Review.countDocuments({ moderationStatus: "hidden" }),
    ]);

    return res.json({
      summary: {
        totalUsers: users.length,
        totalFarmers: users.filter((u) => u.role === "farmer").length,
        totalDealers: users.filter((u) => u.role === "dealer").length,
        totalOrders: orders.length,
        totalAds: ads.length,
        complaintCount,
        reviewCount,
        hiddenReviewCount,
      },
      users,
      ads,
      orders,
      complaintCount,
      reviewCount,
      hiddenReviewCount,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};