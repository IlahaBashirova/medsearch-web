const Pharmacy = require("../models/Pharmacy");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");
const { escapeRegex } = require("../utils/query");

exports.list = async ({ status, search, page, limit }) => {
  const query = {};
  const pagination = getPagination({ page, limit });

  if (status) {
    query.status = status;
  }

  if (search) {
    query.name = { $regex: escapeRegex(search), $options: "i" };
  }

  const [data, total] = await Promise.all([
    Pharmacy.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("ownerId", "name email phone status"),
    Pharmacy.countDocuments(query)
  ]);

  return formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit });
};

exports.create = async (payload) => Pharmacy.create(payload);

exports.update = async (pharmacyId, payload) => {
  const pharmacy = await Pharmacy.findById(pharmacyId);

  if (!pharmacy) {
    throw new AppError("Pharmacy not found", 404);
  }

  Object.assign(pharmacy, payload);
  await pharmacy.save();

  return Pharmacy.findById(pharmacyId).populate("ownerId", "name email phone status");
};
