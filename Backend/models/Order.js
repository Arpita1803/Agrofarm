import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dealerName: {
      type: String,
      required: true,
      trim: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    productImage: {
      type: String,
      default: "🌾",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "processing", "shipped", "delivered", "cancelled"],
      default: "accepted",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);