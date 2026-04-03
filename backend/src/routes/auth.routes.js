const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const rateLimit = require("../middleware/rateLimit");
const validate = require("../middleware/validate");
const { validateRegister, validateLogin } = require("../validation/auth.validation");

const loginRateLimit = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  maxRequests: Number(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS || 10),
  keyPrefix: "auth-login"
});

router.post("/register", validate(validateRegister), asyncHandler(authController.register));
router.post("/login", loginRateLimit, validate(validateLogin), asyncHandler(authController.login));
router.get("/me", auth, asyncHandler(authController.me));

module.exports = router;
