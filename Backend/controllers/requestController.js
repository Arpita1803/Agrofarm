import Request from "../models/Request.js";
import User from "../models/User.js";

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
export const getOpenRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "open" }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// import Request from "../models/Request.js";
// import User from "../models/User.js";

// // Dealer creates request
// export const createRequest = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "dealer") {
//       return res.status(403).json({ message: "Only dealers can create requests" });
//     }

//     const { product, productImage, quantity, minPrice, maxPrice, location, description, requiredDate, mobile } =
//       req.body;

//     if (!product || !quantity || minPrice === undefined || maxPrice === undefined) {
//       return res.status(400).json({ message: "product, quantity, minPrice and maxPrice are required" });
//     }

//     const dealer = await User.findById(req.user.id).select("name");
//     if (!dealer) {
//       return res.status(404).json({ message: "Dealer not found" });
//     }

//     const request = await Request.create({
//       product,
//       productImage,
//       quantity: Number(quantity),
//       minPrice: Number(minPrice),
//       maxPrice: Number(maxPrice),
//       location,
//       description,
//       requiredDate,
//       mobile,
//       dealerName: dealer.name,
//       dealerId: req.user.id,
//       status: "open",
//     });

//     res.status(201).json(request);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Farmer fetches all open requests
// export const getOpenRequests = async (req, res) => {
//   try {
//     const requests = await Request.find({ status: "open" }).sort({ createdAt: -1 });
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


 