const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const medicineController = require("../controllers/medicine.controller");
const {
  validateMedicineCreate,
  validateMedicineUpdate,
  validateMedicineListQuery
} = require("../validation/admin.validation");

router.use(auth, authorize("ADMIN"));

router.get("/", validate(validateMedicineListQuery), asyncHandler(medicineController.list));
router.post("/", validate(validateMedicineCreate), asyncHandler(medicineController.create));
router.get("/:medicineId", asyncHandler(medicineController.getById));
router.patch("/:medicineId", validate(validateMedicineUpdate), asyncHandler(medicineController.update));

module.exports = router;
