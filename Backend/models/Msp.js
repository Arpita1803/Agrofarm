import mongoose from "mongoose";

const mspSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Msp", mspSchema);
