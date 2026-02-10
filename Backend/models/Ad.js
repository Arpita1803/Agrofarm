import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: String,
  quantity: Number,
  price: Number,
  location: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Ad", adSchema);
