import Msp from "../models/Msp.js";

export const upsertMsp = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can set MSP" });
    }

    const { product, price } = req.body;
    if (!product || price === undefined) {
      return res.status(400).json({ message: "product and price are required" });
    }

    const normalizedProduct = String(product).trim().toLowerCase();
    const numericPrice = Number(price);

    if (!normalizedProduct) {
      return res.status(400).json({ message: "product is required" });
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: "price must be a valid non-negative number" });
    }

    const msp = await Msp.findOneAndUpdate(
      { product: normalizedProduct },
      { $set: { price: numericPrice, updatedBy: req.user.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(msp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllMsp = async (_req, res) => {
  try {
    const mspList = await Msp.find().sort({ product: 1 });
    return res.json(mspList);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMspByProduct = async (req, res) => {
  try {
    const { product } = req.params;
    const normalizedProduct = String(product || "").trim().toLowerCase();

    if (!normalizedProduct) {
      return res.status(400).json({ message: "product is required" });
    }

    const msp = await Msp.findOne({ product: normalizedProduct });
    if (!msp) {
      return res.status(404).json({ message: "MSP not found for this product" });
    }

    return res.json(msp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};