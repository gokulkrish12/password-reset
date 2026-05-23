const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail, buildResetEmail } = require("../utils/sendEmail");


const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists." });
    }
    const user = await User.create({ name, email, password });
    return res
      .status(201)
      .json({ message: "Account created.", user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    return res.json({
      message: "Login successful.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      
      return res
        .status(404)
        .json({ message: "No account is registered with that email." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiryMinutes = Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 15;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;
    const { html, text } = buildResetEmail({
      name: user.name,
      resetUrl,
      expiryMinutes,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html,
        text,
      });
    } catch (mailErr) {
      
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      console.error("sendEmail error:", mailErr);
      return res
        .status(500)
        .json({ message: "Could not send reset email. Please try again." });
    }

    return res.json({
      message: `A password reset link has been sent to ${user.email}. It will expire in ${expiryMinutes} minutes.`,
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ valid: false, message: "Token missing." });

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ valid: false, message: "This reset link is invalid or has expired." });
    }
    return res.json({ valid: true, email: user.email });
  } catch (err) {
    console.error("verifyResetToken error:", err);
    return res.status(500).json({ valid: false, message: "Server error." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return res.status(400).json({ message: "Token missing." });
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired." });
    }

    user.password = password; // pre-save hook hashes it
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({
      message: "Your password has been updated. You can now sign in with the new password.",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
