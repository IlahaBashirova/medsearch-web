const adminAuthService = require("../services/adminAuth.service");

exports.login = async (req, res) => {
  const result = await adminAuthService.login(req.body);
  res.status(200).json(result);
};

exports.me = async (req, res) => {
  const result = await adminAuthService.me(req.user.id);
  res.status(200).json(result);
};
