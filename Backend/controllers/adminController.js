import User from "../models/User.js";
import Ad from "../models/Ad.js";
import Order from "../models/Order.js";

export const getAdminDashboard = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access this resource" });
    }

    const [users, ads, orders] = await Promise.all([
      User.find().select("name email role createdAt").sort({ createdAt: -1 }),
      Ad.find().sort({ createdAt: -1 }).limit(100),
      Order.find().sort({ createdAt: -1 }).limit(100),
    ]);

    const complaintCount = 0;

    return res.json({
      summary: {
        totalUsers: users.length,
        totalFarmers: users.filter((u) => u.role === "farmer").length,
        totalDealers: users.filter((u) => u.role === "dealer").length,
        totalOrders: orders.length,
        totalAds: ads.length,
        complaintCount,
      },
      users,
      ads,
      orders,
      complaintCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
