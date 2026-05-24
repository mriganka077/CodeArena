import express from "express";
import { protect } from "../middleware/auth.js";
import AssessmentResult from "../models/AssessmentResult.js";
import Drive from "../models/Drive.js";
import {
  sendEmail,
} from "../utils/sendEmail.js";

const router = express.Router();

router.post("/submit-result", protect, async (req, res) => {
  const {
    driveId,
    score,
    timeTaken,
    status,
    violations,
    terminationReason,
  
    codingAnswers,
    mcqAnswers,
  
  } = req.body;

  try {
    const existingResult = await AssessmentResult.findOne({
      userId: req.user._id,
      driveId: driveId,
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "Interview already submitted.",
      });
    }

    const drive = await Drive.findById(driveId);

    const newResult = await AssessmentResult.create({
      codingAnswers,
      mcqAnswers,
      userId: req.user._id,
      driveId: driveId,
      score: score || 0,
      timeTaken: timeTaken || 0,
      status: status,
      violations: violations,
      terminationReason: terminationReason || "",
    });

    // =========================
    // EMAIL
    // =========================

    let subject = "";
    let html = "";

    // COMPLETED
    if (status === "Completed") {
      subject = `Assessment Completed Successfully - ${drive?.hiringPositionName || "CodeArena"}`;

      html = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0d0d1a;color:#fff;border-radius:18px;overflow:hidden;">
        
        <div style="background:linear-gradient(135deg,#6C63FF,#2A1454);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:26px;">CodeArena</h1>
          <p style="margin-top:8px;color:#d4d4d8;">
            Assessment Submission Successful
          </p>
        </div>

        <div style="padding:32px;">
          <p style="font-size:16px;">
            Hello <strong>${req.user.firstName} ${req.user.lastName}</strong>,
          </p>

          <p style="color:#a1a1aa;line-height:1.7;">
            Your assessment for the position of 
            <strong style="color:#fff;">
              ${drive?.hiringPositionName || "Candidate Assessment"}
            </strong>
            has been submitted successfully.
          </p>

          <div style="background:#18181b;border:1px solid #27272a;border-radius:14px;padding:20px;margin:28px 0;">
            <p><strong>Status:</strong> Completed</p>
            <p><strong>Score:</strong> ${score}</p>
            <p><strong>Time Taken:</strong> ${Math.floor(timeTaken / 60)} min ${timeTaken % 60} sec</p>
          </div>

          <p style="color:#a1a1aa;line-height:1.7;">
            Thank you for participating in the assessment process.
            Our recruitment team will review your performance and contact you regarding the next steps.
          </p>

          <br/>

          <p style="color:#71717a;">
            Best Regards,<br/>
            CodeArena Recruitment Team
          </p>
        </div>
      </div>
      `;
    }

    // TERMINATED
    else if (status === "Terminated") {
      subject = `Assessment Terminated - ${drive?.hiringPositionName || "CodeArena"}`;

      html = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#0d0d1a;color:#fff;border-radius:18px;overflow:hidden;">
        
        <div style="background:linear-gradient(135deg,#dc2626,#7f1d1d);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:26px;">CodeArena</h1>
          <p style="margin-top:8px;color:#fecaca;">
            Assessment Session Terminated
          </p>
        </div>

        <div style="padding:32px;">
          <p style="font-size:16px;">
            Hello <strong>${req.user.firstName} ${req.user.lastName}</strong>,
          </p>

          <p style="color:#a1a1aa;line-height:1.7;">
            Your assessment session for the position of 
            <strong style="color:#fff;">
              ${drive?.hiringPositionName || "Candidate Assessment"}
            </strong>
            was terminated due to a violation of assessment rules.
          </p>

          <div style="background:#1f1111;border:1px solid #7f1d1d;border-radius:14px;padding:20px;margin:28px 0;">
            <p><strong>Status:</strong> Terminated</p>
            <p><strong>Reason:</strong> ${terminationReason}</p>
          </div>

          <p style="color:#a1a1aa;line-height:1.7;">
            If you believe this occurred because of a technical issue,
            please contact the recruitment team for clarification.
          </p>

          <br/>

          <p style="color:#71717a;">
            Regards,<br/>
            CodeArena Recruitment Team
          </p>
        </div>
      </div>
      `;
    }

    // SEND MAIL
    await sendEmail({
      to: req.user.email,
      subject,
      html,
    });

    res.status(201).json({
      success: true,
      data: newResult,
    });
  } catch (error) {
    console.error("Result submission error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during submission.",
    });
  }
});

router.get("/my-drives", protect, async (req, res) => {
  try {
    const drives = await Drive.find({
      assignedCandidates: req.user._id,
   }).sort({ createdAt: -1 });

    const results = await AssessmentResult.find({
      userId: req.user._id,
    }).populate("driveId");

    res.status(200).json({
      success: true,
      drives,
      results,
   });
  } catch (error) {
    console.error("My drives fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Server error fetching drives.",
    });
  }
});

export default router;