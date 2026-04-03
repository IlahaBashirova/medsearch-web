const userRemindersService = require("../services/userReminders.service");

exports.listMine = async (req, res) => {
  const result = await userRemindersService.listByUser(req.user.id);
  res.status(200).json(result);
};

exports.createMine = async (req, res) => {
  const result = await userRemindersService.createForUser(req.user.id, req.body);
  res.status(201).json(result);
};

exports.removeMine = async (req, res) => {
  await userRemindersService.removeForUser(req.user.id, req.params.reminderId);
  res.status(204).send();
};
