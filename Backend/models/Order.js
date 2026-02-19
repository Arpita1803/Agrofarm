import mongoose from "mongoose";
import { ORDER_STATUSES } from "../constants/orderStatus.js";

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    updatedByRole: { type: String, enum: ["farmer", "dealer"], required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    deliveryDate: {
      type: String,
      default: "",
    },
    deliveryMode: {
      type: String,
      enum: ["farmer_delivery", "dealer_pickup", "third_party", "meet_point"],
      default: "farmer_delivery",
    },
    deliveryCost: {
      type: Number,
      default: 0,
    },
    meetingPlace: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "placed",
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);