const router = require("express").Router();
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const notificationController = require("../controllers/notification.controller");

router.use(auth);

router.get("/", asyncHandler(notificationController.listMine));
router.patch("/read-all", asyncHandler(notificationController.markAllRead));
router.patch("/:notificationId/read", asyncHandler(notificationController.markRead));

module.exports = router;
