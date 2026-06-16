import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import axios from "axios";
import { verifyOtp } from "../controllers/auth.js";

import OTP from "../models/OTP.js";
import { sendEmail, verificationEmailHTML, otpEmailHTML } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      picture: user.picture,
    },
  });
};

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post(
  "/signup",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { firstName, lastName, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });

      const user = await User.create({ firstName, lastName, email, password });

      const rawToken = user.generateEmailVerifyToken();
      await user.save({ validateBeforeSave: false });

      const verifyURL = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your CodeArena email",
          html: verificationEmailHTML(user.firstName, verifyURL),
        });

        return res.status(201).json({
          success: true,
          message: "Account created! Please check your email to verify your account.",
        });
      } catch (emailError) {
        // Email failed — still created the account, tell the user
        console.error("Email send error:", emailError.message);
        return res.status(201).json({
          success: true,
          message: "Account created but we couldn't send the verification email. Contact support.",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  }
);

// ── GET /api/auth/verify-email/:token ─────────────────────────────────────────
router.get("/verify-email/:token", async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Token is invalid or has expired.",
      });

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // ← Add isNewUser: true so frontend redirects to /registration
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      isNewUser: true,   // ← frontend uses this to redirect
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ success: false, message: "Invalid email or password." });

      if (!user.isVerified)
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in.",
        });

        if (user.twoFactorEnabled) {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
          await OTP.deleteMany({ email: user.email });
        
          const hashedOtp = await bcrypt.hash(otp, 10);
        
          await OTP.create({
            email: user.email,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          });
        
          await sendEmail({
            to: email,
            subject: "Your OTP Code",
            html: otpEmailHTML(otp),
          });
        
          const preAuthToken = jwt.sign(
            { id: user._id, twoFactorPending: true },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
          );
        
          return res.status(200).json({
            success: true,
            twoFactorRequired: true,
            preAuthToken,
            email: user.email, 
          });
        }

      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  }
);

// GOOGLE LOGIN ROUTE
router.post("/google", async (req, res) => {
  const { access_token } = req.body;

  try {
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    console.log("GOOGLE DATA:", data); 

    const { email, given_name, family_name, picture, sub } = data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        googleId: sub,
        picture: picture || "",   
        isVerified: true,
      });
    } else {
      console.log("GOOGLE ROUTE VERSION 2");
      console.log("BEFORE:", user.picture);
      console.log("GOOGLE PICTURE:", picture);

      if (!user.picture) {
        user.picture = picture || "";
      }

      console.log("AFTER:", user.picture);
    
      user.googleId = sub;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ success: false, message: "Google auth failed" });
  }
});

// ── GET /api/auth/me (protected) ──────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", protect, (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully." });
});



router.post("/verify-otp", verifyOtp);

// ── ENABLE 2FA ─────────────────────────────
router.post("/enable-2fa", protect, async (req, res) => {
  req.user.twoFactorEnabled = true;
  await req.user.save();

  res.json({ success: true, message: "2FA enabled" });
});

// ── FORGET PASSWORD ─────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });

    const hashedOtp = await bcrypt.hash(otp, 10);

    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail({
      to: email,
      subject: "Reset Password OTP",
      html: otpEmailHTML(otp),
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ── RESET PASSWORD ─────────────────────────────

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(String(otp), otpRecord.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email }).select("+password");

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;