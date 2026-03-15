const Reservation = require("../models/Reservation");
const { normalizeStatus } = require("../services/adminReservations.service");
const AppError = require("../utils/AppError");

const formatReservationStatus = (status) => {
  const statusMap = {
    ACTIVE: "Aktiv",
    COMPLETED: "Tamamlandı",
    CANCELLED: "Ləğv edildi",
    PENDING: "Aktiv"
  };

  return statusMap[status] || status;
};

const formatReservation = (reservation) => {
  const item = reservation.toObject ? reservation.toObject() : reservation;
  return {
    ...item,
    userId: item.userId?._id ? item.userId._id.toString() : item.userId,
    pharmacyId: item.pharmacyId?._id ? item.pharmacyId._id.toString() : item.pharmacyId,
    medicineId: item.medicineId?._id ? item.medicineId._id.toString() : item.medicineId,
    status: formatReservationStatus(item.status)
  };
};

// Yeni reservation yaratmaq
exports.createReservation = async (req, res) => {
  const userId = req.user.role === "ADMIN" && req.body.userId ? req.body.userId : req.user.id;

  const reservation = await Reservation.create({
    pharmacyId: req.body.pharmacyId || null,
    medicineId: req.body.medicineId || null,
    userId,
    pharmacyName: req.body.pharmacyName,
    medicineName: req.body.medicineName,
    quantity: req.body.quantity,
    price: req.body.price,
    address: req.body.address,
    phone: req.body.phone,
    status: normalizeStatus(req.body.status || "ACTIVE")
  });

  res.status(201).json(formatReservation(reservation));
};

// İstifadəçinin bütün reservation-larını gətirmək
exports.getUserReservations = async (req, res) => {
  const reservations = await Reservation.find({
    userId: req.params.userId,
  });

  res.status(200).json(reservations.map(formatReservation));
};

// 1) Tək bir reservation-u ID ilə gətirmək
exports.getReservationById = async (req, res) => {
  const reservation = await Reservation.findById(req.params.reservationId);

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  if (req.user.role !== "ADMIN" && String(reservation.userId) !== String(req.user.id)) {
    throw new AppError("Forbidden", 403);
  }

  res.status(200).json(formatReservation(reservation));
};

// 2) Reservation statusunu dəyişmək
exports.updateReservationStatus = async (req, res) => {
  const { status } = req.body;

  const updatedReservation = await Reservation.findById(req.params.reservationId);

  if (!updatedReservation) {
    throw new AppError("Reservation not found", 404);
  }

  if (req.user.role !== "ADMIN" && String(updatedReservation.userId) !== String(req.user.id)) {
    throw new AppError("Forbidden", 403);
  }

  updatedReservation.status = normalizeStatus(status);
  await updatedReservation.save();

  res.status(200).json({
    message: "Reservation statusu yeniləndi",
    reservation: formatReservation(updatedReservation),
  });
};

// 3) İstifadəçinin reservation statistikası
exports.getUserReservationStats = async (req, res) => {
  const userId = req.params.userId;

  const reservations = await Reservation.find({ userId });

  const active = reservations.filter((item) => normalizeStatus(item.status) === "ACTIVE").length;
  const completed = reservations.filter((item) => normalizeStatus(item.status) === "COMPLETED").length;
  const cancelled = reservations.filter((item) => normalizeStatus(item.status) === "CANCELLED").length;

  res.status(200).json({
    total: reservations.length,
    active,
    completed,
    cancelled,
  });
};
