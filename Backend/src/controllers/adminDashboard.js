import User from "../models/User.js";
import AssessmentResult from "../models/AssessmentResult.js";
import InterviewResult from "../models/InterviewResult.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments();

    const assessmentsCompleted =
      await AssessmentResult.countDocuments();

    const interviewsConducted =
      await InterviewResult.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalCandidates,
        assessmentsCompleted,
        interviewsConducted,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};