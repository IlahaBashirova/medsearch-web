const Reservation = require("../models/Reservation");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");

const LEGACY_STATUS_MAP = {
  Aktiv: "ACTIVE",
  Tamamlandı: "COMPLETED",
  "Ləğv edildi": "CANCELLED"
};

exports.normalizeStatus = (status) => LEGACY_STATUS_MAP[status] || status;

exports.list = async ({ status, userId, pharmacyId, page, limit }) => {
  const query = {};
  const pagination = getPagination({ page, limit });

  if (status) {
    query.status = exports.normalizeStatus(status);
  }

  if (userId) {
    query.userId = userId;
  }

  if (pharmacyId) {
    query.pharmacyId = pharmacyId;
  }

  const [data, total] = await Promise.all([
    Reservation.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("userId", "name email")
      .populate("pharmacyId", "name"),
    Reservation.countDocuments(query)
  ]);

  return formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit });
};

exports.getById = async (reservationId) => {
  const reservation = await Reservation.findById(reservationId)
    .populate("userId", "name email")
    .populate("pharmacyId", "name")
    .populate("medicineId", "name");

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  return reservation;
};

exports.updateStatus = async (reservationId, status) => {
  const normalizedStatus = exports.normalizeStatus(status);
  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }

  reservation.status = normalizedStatus;
  await reservation.save();

  return reservation;
};
