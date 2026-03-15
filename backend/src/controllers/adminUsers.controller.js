const adminUsersService = require("../services/adminUsers.service");

exports.list = async (req, res) => {
  const result = await adminUsersService.list(req.query);
  res.status(200).json(result);
};

exports.getById = async (req, res) => {
  const result = await adminUsersService.getById(req.params.userId);
  res.status(200).json(result);
};

exports.update = async (req, res) => {
  const result = await adminUsersService.update(req.params.userId, req.body);
  res.status(200).json(result);
};
