import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  product: String,
  quantity: Number,
  priceExpected: Number,
  location: String,
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Request", requestSchema);
