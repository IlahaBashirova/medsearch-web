const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    general: {
      platformName: { type: String, default: "MedSearch" },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
      timezone: { type: String, default: "UTC" },
      maintenanceMode: { type: Boolean, default: false }
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: true },
      reservationAlerts: { type: Boolean, default: true },
      reminderAlerts: { type: Boolean, default: true }
    },
    email: {
      fromName: { type: String, default: "MedSearch" },
      fromAddress: { type: String, default: "" },
      replyTo: { type: String, default: "" },
      provider: { type: String, default: "smtp" }
    },
    security: {
      sessionTtlHours: { type: Number, default: 168 },
      passwordMinLength: { type: Number, default: 8 },
      require2faForAdmins: { type: Boolean, default: false },
      allowNewAdminRegistration: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Setting", settingSchema);
