const router = require("express").Router();
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const userRemindersController = require("../controllers/userReminders.controller");
const {
  validateUserReminderCreate,
  validateUserReminderIdParam
} = require("../validation/userReminders.validation");

router.use(auth);

router.get("/", asyncHandler(userRemindersController.listMine));
router.post("/", validate(validateUserReminderCreate), asyncHandler(userRemindersController.createMine));
router.delete(
  "/:reminderId",
  validate(validateUserReminderIdParam),
  asyncHandler(userRemindersController.removeMine)
);

module.exports = router;
