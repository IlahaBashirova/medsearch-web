const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const analyticsController = require("../controllers/analytics.controller");

router.get("/", auth, authorize("ADMIN"), asyncHandler(analyticsController.getOverview));

module.exports = router;
