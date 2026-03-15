const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  mapLink: { type: String, default: "" },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "PENDING"],
    default: "ACTIVE"
  },
  openingHours: { type: String, default: "" },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pharmacy", pharmacySchema);
 
