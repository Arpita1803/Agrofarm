import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["farmer", "dealer", "authority"],
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const dealSubmissionSchema = new mongoose.Schema(
  {
    submittedByRole: {
      type: String,
      enum: ["farmer", "dealer"],
      required: true,
    },
    finalQuantity: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },
    deliveryDate: { type: String, required: true },
    deliveryMode: { type: String, required: true },
    deliveryCost: { type: Number, default: 0 },
    meetingPlace: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    dealSubmissions: [dealSubmissionSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

chatSchema.index({ farmerId: 1, dealerId: 1, requestId: 1 }, { unique: false });
chatSchema.index({ lastMessageAt: -1 });

export default mongoose.model("Chat", chatSchema);
