const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  mapLink: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pharmacy", pharmacySchema);
