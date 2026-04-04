const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const Reservation = require("../models/Reservation");
const Reminder = require("../models/Reminder");
const SupportConversation = require("../models/SupportConversation");

exports.getOverview = async () => {
  const [
    usersCount,
    pharmaciesCount,
    medicinesCount,
    reservationsCount,
    activeRemindersCount,
    supportOpenCount,
    recentUsers,
    recentReservations
  ] = await Promise.all([
    User.countDocuments(),
    Pharmacy.countDocuments(),
    Medicine.countDocuments(),
    Reservation.countDocuments(),
    Reminder.countDocuments({ isEnabled: true }),
    SupportConversation.countDocuments({ status: { $ne: "RESOLVED" } }),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email role status createdAt"),
    Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .populate("pharmacyId", "name")
  ]);

  return {
    metrics: {
      users: usersCount,
      pharmacies: pharmaciesCount,
      medicines: medicinesCount,
      reservations: reservationsCount,
      activeReminders: activeRemindersCount,
      openSupportConversations: supportOpenCount
    },
    recentUsers,
    recentReservations
  };
};
