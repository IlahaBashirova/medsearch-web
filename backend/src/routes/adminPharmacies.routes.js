const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const adminPharmaciesController = require("../controllers/adminPharmacies.controller");
const {
  validatePharmacyCreate,
  validatePharmacyUpdate
} = require("../validation/admin.validation");

router.use(auth, authorize("ADMIN"));

router.get("/", asyncHandler(adminPharmaciesController.list));
router.post("/", validate(validatePharmacyCreate), asyncHandler(adminPharmaciesController.create));
router.get("/:pharmacyId", asyncHandler(adminPharmaciesController.getById));
router.patch(
  "/:pharmacyId",
  validate(validatePharmacyUpdate),
  asyncHandler(adminPharmaciesController.update)
);

module.exports = router;
