import Request from "../models/Request.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

// Dealer creates request
export const createRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "dealer") {
      return res.status(403).json({ message: "Only dealers can create requests" });
    }

    const { product, productImage, quantity, minPrice, maxPrice, location, description, requiredDate, mobile } =
      req.body;

    if (!product || !quantity || minPrice === undefined || maxPrice === undefined) {
      return res.status(400).json({ message: "product, quantity, minPrice and maxPrice are required" });
    }

    const dealer = await User.findById(req.user.id).select("name");
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    const request = await Request.create({
      product,
      productImage,
      quantity: Number(quantity),
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      location,
      description,
      requiredDate,
      mobile,
      dealerName: dealer.name,
      dealerId: req.user.id,
      status: "open",
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Farmer fetches all open requests
export const getOpenRequests = async (_req, res) => {
  try {
    const requests = await Request.find({ status: "open" }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Farmer accepts request -> create order
export const acceptRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can accept requests" });
    }

    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "open") {
      return res.status(400).json({ message: "Request is not open for acceptance" });
    }

    const farmer = await User.findById(req.user.id).select("name");
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const agreedPrice = Number(req.body?.agreedPrice ?? request.maxPrice);

    const order = await Order.create({
      requestId: request._id,
      dealerId: request.dealerId,
      dealerName: request.dealerName,
      farmerId: req.user.id,
      farmerName: farmer.name,
      product: request.product,
      productImage: request.productImage,
      quantity: request.quantity,
      agreedPrice,
      status: "placed",
      statusHistory: [{ status: "placed", updatedByRole: "farmer", updatedAt: new Date() }],
    });

    request.status = "accepted";
    await request.save();

    return res.status(201).json({
      message: "Request accepted and order created",
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
};
