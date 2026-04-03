const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    recipientRole: {
      type: String,
      enum: ["ADMIN", "USER", "PHARMACY_OWNER"],
      required: true
    },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    relatedConversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportConversation",
      default: null
    },
    isRead: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
