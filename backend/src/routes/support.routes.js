const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const supportController = require("../controllers/support.controller");
const {
  validateSupportCreate,
  validateSupportReply,
  validateSupportStatus
} = require("../validation/admin.validation");

router.post("/", auth, validate(validateSupportCreate), asyncHandler(supportController.create));
router.get("/my", auth, asyncHandler(supportController.getMine));

router.use(auth, authorize("ADMIN"));

router.get("/", asyncHandler(supportController.list));
router.post(
  "/:conversationId/reply",
  validate(validateSupportReply),
  asyncHandler(supportController.replyAsAdmin)
);
router.patch(
  "/:conversationId/status",
  validate(validateSupportStatus),
  asyncHandler(supportController.updateStatus)
);

module.exports = router;
