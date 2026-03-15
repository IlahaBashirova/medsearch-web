const adminDashboardService = require("../services/adminDashboard.service");

exports.getOverview = async (req, res) => {
  const result = await adminDashboardService.getOverview();
  res.status(200).json(result);
};
