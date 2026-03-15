const adminRemindersService = require("../services/adminReminders.service");

exports.list = async (req, res) => {
  const result = await adminRemindersService.list(req.query);
  res.status(200).json(result);
};

exports.create = async (req, res) => {
  const result = await adminRemindersService.create(req.body);
  res.status(201).json(result);
};

exports.update = async (req, res) => {
  const result = await adminRemindersService.update(req.params.reminderId, req.body);
  res.status(200).json(result);
};
