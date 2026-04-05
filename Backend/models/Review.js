import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ["farmer", "dealer", "admin"],
      required: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revieweeRole: {
      type: String,
      enum: ["farmer", "dealer", "admin"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    photoUrls: {
      type: [String],
      default: [],
    },
    moderationStatus: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
