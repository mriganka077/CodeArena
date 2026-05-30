import express from "express";
import { adminLogin, adminVerifyOtp } from "../controllers/adminAuth.js";
import { adminProtect } from "../middleware/adminProtect.js";
import Admin from "../models/Admin.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// ADMIN AUTH
// ─────────────────────────────────────────────────────────────

router.post("/login", adminLogin);
router.post("/verify-otp", adminVerifyOtp);

// ─────────────────────────────────────────────────────────────
// GET CURRENT ADMIN
// ─────────────────────────────────────────────────────────────

router.get("/me", adminProtect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Fetch Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// UPLOAD ADMIN PHOTO
// ─────────────────────────────────────────────────────────────

router.put(
  "/upload-photo",
  adminProtect,
  upload.single("photo"),
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No photo uploaded",
        });
      }

      admin.photo = `/uploads/admin/${req.file.filename}`;

      await admin.save();

      return res.json({
        success: true,
        photo: admin.photo,
      });
    } catch (error) {
      console.error("Upload Photo Error:", error);

      return res.status(500).json({
        success: false,
        message: "Photo upload failed",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────

router.put("/update-profile", adminProtect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      phoneCountry,
    } = req.body;

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (firstName || lastName) {
      admin.name = `${firstName || ""} ${lastName || ""}`.trim();
    }

    admin.phone = phone || admin.phone || "";
    admin.phoneCountry =
      phoneCountry || admin.phoneCountry || "+91";

    await admin.save();

    return res.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────

router.put("/change-password", adminProtect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    admin.password = newPassword;

    await admin.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});

export default router;