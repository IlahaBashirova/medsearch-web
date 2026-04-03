const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const settingsController = require("../controllers/settings.controller");

router.use(auth, authorize("ADMIN"));

router.get("/", asyncHandler(settingsController.getSettings));
router.patch("/", asyncHandler(settingsController.updateSettings));
router.get("/system-info", asyncHandler(settingsController.getSystemInfo));
router.get("/quick-actions", asyncHandler(settingsController.getQuickActions));

module.exports = router;
