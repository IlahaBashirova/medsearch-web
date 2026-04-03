const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const adminUsersController = require("../controllers/adminUsers.controller");
const { validateUserUpdate } = require("../validation/admin.validation");

router.use(auth, authorize("ADMIN"));

router.get("/", asyncHandler(adminUsersController.list));
router.get("/:userId", asyncHandler(adminUsersController.getById));
router.patch("/:userId", validate(validateUserUpdate), asyncHandler(adminUsersController.update));

module.exports = router;
