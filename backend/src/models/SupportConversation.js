const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ["ADMIN", "USER", "PHARMACY_OWNER"],
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const supportConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    pharmacyRef: { type: String, default: "", trim: true },
    pharmacyName: { type: String, default: "", trim: true },
    subject: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["OPEN", "PENDING", "RESOLVED"],
      default: "OPEN"
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM"
    },
    messages: {
      type: [supportMessageSchema],
      default: []
    },
    lastMessageAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SupportConversation", supportConversationSchema);
