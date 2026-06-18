import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import {
  getProfile,
  updateProfile,
  uploadPhoto,
  uploadResume,
  deleteResume,
  updateEducation,
  uploadEduDoc,
  deleteEduDoc,
  analyzeResume,
  completeSetup,
} from "../controllers/profile.js";
const router = express.Router();

// ── Routes ────────────────────────────────────────────────────────────────────
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.post("/photo", protect, upload.single("photo"), uploadPhoto);
router.post("/resume/analyze", protect, analyzeResume);
router.delete("/resume", protect, deleteResume);

router.put("/education", protect, updateEducation);
router.delete("/education/:eduId/doc/:docId", protect, deleteEduDoc);
router.post("/resume", protect, upload.single("resume"), uploadResume);

router.post(
  "/education/:eduId/doc",
  protect,
  upload.single("doc"),
  uploadEduDoc
);

router.post(
  "/complete-setup",
  protect,
  upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 }
  ]),
  completeSetup
);


export default router;