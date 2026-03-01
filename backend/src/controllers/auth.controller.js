const authService = require("../services/auth.service");


exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};


exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

exports.me = async (req, res, next) => {
  try {
    const result = await authService.me(req.user.id);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};


