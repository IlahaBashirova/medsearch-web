const Pharmacy = require("../models/Pharmacy");

exports.getAll = async (req, res) => {
  const data = await Pharmacy.find().sort({ createdAt: -1 });
  res.json({ data, total: data.length, page: 1, limit: 20 });
};
