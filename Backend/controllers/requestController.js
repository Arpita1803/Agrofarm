import Request from "../models/Request.js";

// Dealer creates request
export const createRequest = async (req, res) => {
  try {
    const request = await Request.create({
      ...req.body,
      dealerId: req.user.id,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Farmer fetches all open requests
export const getOpenRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "open" })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
