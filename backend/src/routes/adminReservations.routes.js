const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const adminReservationsController = require("../controllers/adminReservations.controller");
const { validateReservationStatusUpdate } = require("../validation/admin.validation");

router.use(auth, authorize("ADMIN"));

router.get("/", asyncHandler(adminReservationsController.list));
router.get("/:reservationId", asyncHandler(adminReservationsController.getById));
router.patch(
  "/:reservationId/status",
  validate(validateReservationStatusUpdate),
  asyncHandler(adminReservationsController.updateStatus)
);

module.exports = router;
