const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const result = await authService.me(req.user.id);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

