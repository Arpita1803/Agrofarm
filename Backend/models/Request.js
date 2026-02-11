import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
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
    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    maxPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      default: "India",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    requiredDate: {
      type: Date,
    },
    mobile: {
      type: String,
      default: "",
      trim: true,
    },
    dealerName: {
      type: String,
      required: true,
      trim: true,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "accepted", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);