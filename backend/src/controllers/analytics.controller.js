const analyticsService = require("../services/analytics.service");

exports.getOverview = async (req, res) => {
  const result = await analyticsService.getOverview();
  res.status(200).json(result);
};
