const router = require("express").Router();
const pharmacyController = require("../controllers/pharmacy.controller");

router.get("/", pharmacyController.getAll);
router.get("/search", pharmacyController.search);
router.get("/:id", pharmacyController.getById);

module.exports = router;
