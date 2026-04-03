const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null
    },
    title: { type: String, required: true, trim: true },
    dose: { type: String, default: "" },
    scheduledAt: { type: Date, required: true },
    hours: { type: [String], default: [] },
    timesPerDay: { type: Number, default: 1 },
    tag: { type: String, default: "" },
    channel: {
      type: String,
      enum: ["PUSH", "EMAIL", "SMS", "IN_APP"],
      default: "IN_APP"
    },
    isEnabled: { type: Boolean, default: true },
    lastSentAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Reminder", reminderSchema);
