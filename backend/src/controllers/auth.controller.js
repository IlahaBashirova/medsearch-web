const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(201).json(result);
};

exports.login = async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(200).json(result);
};

exports.me = async (req, res) => {
  const result = await authService.me(req.user.id);
  return res.status(200).json(result);
};
