const settingsService = require("../services/settings.service");

exports.getSettings = async (req, res) => {
  const result = await settingsService.getSettings();
  res.status(200).json(result);
};

exports.updateSettings = async (req, res) => {
  const result = await settingsService.updateSettings(req.body);
  res.status(200).json(result);
};

exports.getSystemInfo = async (req, res) => {
  const result = await settingsService.getSystemInfo();
  res.status(200).json(result);
};

exports.getQuickActions = async (req, res) => {
  const result = await settingsService.getQuickActions();
  res.status(200).json(result);
};
