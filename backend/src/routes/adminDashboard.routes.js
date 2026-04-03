const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const adminDashboardController = require("../controllers/adminDashboard.controller");

router.get("/", auth, authorize("ADMIN"), asyncHandler(adminDashboardController.getOverview));

module.exports = router;
