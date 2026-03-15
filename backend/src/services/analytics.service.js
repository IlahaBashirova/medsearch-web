const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const Reservation = require("../models/Reservation");
const SupportConversation = require("../models/SupportConversation");

exports.getOverview = async () => {
  const [usersByRole, reservationsByStatus, pharmaciesByStatus, supportByStatus, medicineCount] =
    await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Reservation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Pharmacy.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      SupportConversation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Medicine.countDocuments()
    ]);

  return {
    usersByRole,
    reservationsByStatus,
    pharmaciesByStatus,
    supportByStatus,
    medicineCount
  };
};
