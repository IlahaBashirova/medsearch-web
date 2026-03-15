const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const adminRemindersController = require("../controllers/adminReminders.controller");
const {
  validateReminderCreate,
  validateReminderUpdate,
  validateReminderListQuery
} = require("../validation/admin.validation");

router.use(auth, authorize("ADMIN"));

router.get("/", validate(validateReminderListQuery), asyncHandler(adminRemindersController.list));
router.post("/", validate(validateReminderCreate), asyncHandler(adminRemindersController.create));
router.patch(
  "/:reminderId",
  validate(validateReminderUpdate),
  asyncHandler(adminRemindersController.update)
);

module.exports = router;
