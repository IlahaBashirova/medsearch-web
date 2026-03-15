const medicineService = require("../services/medicine.service");

exports.list = async (req, res) => {
  const result = await medicineService.list(req.query);
  res.status(200).json(result);
};

exports.create = async (req, res) => {
  const result = await medicineService.create(req.body);
  res.status(201).json(result);
};

exports.getById = async (req, res) => {
  const result = await medicineService.getById(req.params.medicineId);
  res.status(200).json(result);
};

exports.update = async (req, res) => {
  const result = await medicineService.update(req.params.medicineId, req.body);
  res.status(200).json(result);
};
