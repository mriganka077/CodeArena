import User from "../models/User.js";
import Drive from "../models/Drive.js";
import InterviewResult from "../models/InterviewResult.js";
import sendAssessmentMail from "../utils/sendAssessmentMail.js";

export const submitResult = async (req, res) => {
  try {
    const {
      driveId,
      score,
      timeTaken,
      status,
      violations,
      terminationReason,
    } = req.body;

    const result = await InterviewResult.create({
      userId: req.user.id,
      driveId,
      score,
      timeTaken,
      status,
      violations,
      terminationReason,
    });

    const user = await User.findById(req.user.id);
    const drive = await Drive.findById(driveId);

    await sendAssessmentMail({
      candidateEmail: user.email,
      candidateName: `${user.firstName} ${user.lastName}`,
      driveName: drive.hiringPositionName,
      status,
      reason: terminationReason,
      score,
    });

    res.status(200).json({
      success: true,
      result,
    });

  } catch (err) {
    console.error("SUBMIT RESULT ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Assessment submission failed",
    });
  }
};