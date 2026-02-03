import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: String, required: true },
    quantity: { type: String, required: true },
    priceExpected: { type: String },
    location: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["open", "accepted", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);


