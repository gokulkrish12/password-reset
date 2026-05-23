const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", resetLimiter, forgotPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password/:token", resetLimiter, resetPassword);

module.exports = router;
