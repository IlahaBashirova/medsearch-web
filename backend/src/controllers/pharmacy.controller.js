const Pharmacy = require("../models/Pharmacy");

exports.getAll = async (req, res) => {
  const data = await Pharmacy.find().sort({ createdAt: -1 });
  res.json({ data, total: data.length, page: 1, limit: 20 });
};

exports.search = async (req, res) => {
  const q = (req.query.q || "").trim();
  const data = await Pharmacy.find({
    name: { $regex: q, $options: "i" },
  });
  res.json(data);
};

exports.getById = async (req, res) => {
  const item = await Pharmacy.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
};
