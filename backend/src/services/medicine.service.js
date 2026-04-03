const Medicine = require("../models/Medicine");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");
const { escapeRegex } = require("../utils/query");

exports.list = async ({ pharmacyId, search, isActive, page, limit }) => {
  const query = {};
  const pagination = getPagination({ page, limit });

  if (pharmacyId) {
    query.pharmacyId = pharmacyId;
  }

  if (search) {
    query.name = { $regex: escapeRegex(search), $options: "i" };
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const [data, total] = await Promise.all([
    Medicine.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("pharmacyId", "name status"),
    Medicine.countDocuments(query)
  ]);

  return formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit });
};

exports.create = async (payload) => Medicine.create(payload);

exports.getById = async (medicineId) => {
  const medicine = await Medicine.findById(medicineId).populate("pharmacyId", "name status");

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  return medicine;
};

exports.update = async (medicineId, payload) => {
  const medicine = await Medicine.findById(medicineId);

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  Object.assign(medicine, payload);
  await medicine.save();

  return Medicine.findById(medicineId).populate("pharmacyId", "name status");
};
