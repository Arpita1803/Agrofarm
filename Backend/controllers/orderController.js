import Order from "../models/Order.js";

export const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let query = {};

    if (req.user.role === "farmer") {
      query = { farmerId: req.user.id };
    } else if (req.user.role === "dealer") {
      query = { dealerId: req.user.id };
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
