const adminPharmaciesService = require("../services/adminPharmacies.service");

exports.list = async (req, res) => {
  const result = await adminPharmaciesService.list(req.query);
  res.status(200).json(result);
};

exports.create = async (req, res) => {
  const result = await adminPharmaciesService.create(req.body);
  res.status(201).json(result);
};

exports.update = async (req, res) => {
  const result = await adminPharmaciesService.update(req.params.pharmacyId, req.body);
  res.status(200).json(result);
};
