const Pharmacy = require("../models/Pharmacy");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");
const { escapeRegex } = require("../utils/query");

exports.getAll = async (req, res) => {
  const pagination = getPagination(req.query);
  const [data, total] = await Promise.all([
    Pharmacy.find()
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Pharmacy.countDocuments()
  ]);

  res.json(formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit }));
};

exports.search = async (req, res) => {
  const q = (req.query.q || "").trim();
  const pagination = getPagination(req.query);
  const query = q
    ? {
        name: { $regex: escapeRegex(q), $options: "i" }
      }
    : {};
  const [data, total] = await Promise.all([
    Pharmacy.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Pharmacy.countDocuments(query)
  ]);

  res.json(formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit }));
};

exports.getById = async (req, res) => {
  const item = await Pharmacy.findById(req.params.id);
  if (!item) throw new AppError("Pharmacy not found", 404);
  res.json(item);
};
