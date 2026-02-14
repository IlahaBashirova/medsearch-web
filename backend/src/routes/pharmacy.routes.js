const router = require("express").Router();
const pharmacyController = require("../controllers/pharmacy.controller");

router.get("/", pharmacyController.getAll);

module.exports = router;
