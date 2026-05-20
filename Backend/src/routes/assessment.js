import express from "express";
import { protect } from "../middleware/auth.js";
import Interview from "../models/Interview.js";
import InterviewResult from "../models/InterviewResult.js";

const router = express.Router();


router.post("/submit-result", protect, async (req, res) => {
  const { driveId, score, timeTaken, status, violations, terminationReason } = req.body;

  try {
    const existingResult = await InterviewResult.findOne({
      userId: req.user._id,
      driveId: driveId
    });

    if (existingResult) {
      return res.status(400).json({ success: false, message: "Interview already submitted." });
    }

    const newResult = await InterviewResult.create({
      userId: req.user._id,
      driveId: driveId,
      score: score || 0,
      timeTaken: timeTaken || 0,
      status: status,
      violations: violations,
      terminationReason: terminationReason || ""
    });

    res.status(201).json({ success: true, data: newResult });
  } catch (error) {
    console.error("Result submission error:", error);
    res.status(500).json({ success: false, message: "Server error during submission." });
  }
});



router.get("/my-drives", protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ userIds: req.user._id })
      .populate("driveId")
      .sort({ createdAt: -1 });

    const results = await InterviewResult.find({ userId: req.user._id })
      .populate("driveId");

    res.status(200).json({ success: true, interviews, results });
  } catch (error) {
    console.error("My drives fetch error:", error);
    res.status(500).json({ success: false, message: "Server error fetching drives." });
  }
});

export default router;
