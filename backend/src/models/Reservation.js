const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    pharmacyName: {
      type: String,
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Aktiv", "Tamamlandı", "Ləğv edildi"],
      default: "Aktiv",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reservation", reservationSchema);
