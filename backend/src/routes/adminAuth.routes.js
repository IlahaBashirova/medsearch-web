const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../middleware/asyncHandler");
const rateLimit = require("../middleware/rateLimit");
const validate = require("../middleware/validate");
const adminAuthController = require("../controllers/adminAuth.controller");
const { validateAdminLogin } = require("../validation/admin.validation");

const adminLoginRateLimit = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  maxRequests: Number(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS || 10),
  keyPrefix: "admin-login"
});

router.post(
  "/login",
  adminLoginRateLimit,
  validate(validateAdminLogin),
  asyncHandler(adminAuthController.login)
);
router.get("/me", auth, authorize("ADMIN"), asyncHandler(adminAuthController.me));

module.exports = router;
