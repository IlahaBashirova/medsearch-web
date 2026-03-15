const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    description: { type: String, default: "" },
    manufacturer: { type: String, default: "" },
    dosageForm: { type: String, default: "" },
    strength: { type: String, default: "" },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true
    },
    requiresPrescription: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Medicine", medicineSchema);
