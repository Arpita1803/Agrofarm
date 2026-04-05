import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    raisedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    raisedByRole: {
      type: String,
      enum: ["farmer", "dealer", "admin"],
      required: true,
    },
    type: {
      type: String,
      enum: ["order_related", "website_related"],
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "rejected"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
    history: {
      type: [
        {
          status: {
            type: String,
            enum: ["open", "in_progress", "resolved", "rejected"],
            required: true,
          },
          priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
          },
          note: {
            type: String,
            default: "",
            trim: true,
          },
          changedByRole: {
            type: String,
            enum: ["farmer", "dealer", "admin"],
            required: true,
          },
          changedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          changedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    dueAt: {
      type: Date,
      default: null,
      index: true,
    },
    escalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalationLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    messages: {
      type: [
        {
          senderRole: {
            type: String,
            enum: ["farmer", "dealer", "admin"],
            required: true,
          },
          senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
          },
          isInternal: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastUserMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastAdminMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
