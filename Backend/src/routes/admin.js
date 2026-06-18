import express from "express";
import { adminLogin, adminVerifyOtp } from "../controllers/adminAuth.js";
import { adminProtect } from "../middleware/adminProtect.js";
import Admin from "../models/Admin.js";
import upload from "../middleware/upload.js";
import Domain from "../models/Domain.js";

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

// ── Domains ───────────────────────────────────────────────────────────────────

// GET all categories with their domains
router.get("/domains", async (req, res) => {
  try {
    const domains = await Domain.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: domains });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch domains" });
  }
});

// POST create a new category
router.post("/domains", async (req, res) => {
  try {
    const { category, domains } = req.body;
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const exists = await Domain.findOne({ category: category.trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Category already exists." });
    }

    const newCategory = await Domain.create({
      category: category.trim(),
      domains: (domains || []).map((d) => d.trim()).filter(Boolean),
    });
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update a category (rename + full domain list replace)
router.put("/domains/:id", async (req, res) => {
  try {
    const { category, domains } = req.body;
    const updated = await Domain.findByIdAndUpdate(
      req.params.id,
      {
        ...(category && { category: category.trim() }),
        ...(domains !== undefined && {
          domains: domains.map((d) => d.trim()).filter(Boolean),
        }),
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE a full category
router.delete("/domains/:id", async (req, res) => {
  try {
    await Domain.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete category." });
  }
});

// POST add a single domain to an existing category
router.post("/domains/:id/domain", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || !domain.trim()) {
      return res.status(400).json({ success: false, message: "Domain name is required." });
    }
    const updated = await Domain.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { domains: domain.trim() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE a single domain from a category
router.delete("/domains/:id/domain", async (req, res) => {
  try {
    const { domain } = req.body;
    const updated = await Domain.findByIdAndUpdate(
      req.params.id,
      { $pull: { domains: domain } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

      console.log(req.file);

      admin.photo = req.file.location;

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