const router = require("express").Router();
const pharmacyController = require("../controllers/pharmacy.controller");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", asyncHandler(pharmacyController.getAll));
router.get("/search", asyncHandler(pharmacyController.search));
router.get("/:id", asyncHandler(pharmacyController.getById));

module.exports = router;
