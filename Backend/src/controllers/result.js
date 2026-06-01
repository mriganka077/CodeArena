import AssessmentResult from "../models/AssessmentResult.js";
import InterviewResult from "../models/InterviewResult.js";

export const getResult = async (req, res) => {
  try {
    const { driveId, type } = req.params;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID not found." });
    }
    
    const userId = req.user._id;

    let result;
    if (type === 'assessment') {
      result = await AssessmentResult.findOne({ driveId: driveId, userId: userId })
                                     .select('-createdAt -updatedAt -__v');
    } else if (type === 'interview') {
      result = await InterviewResult.findOne({ driveId: driveId, userId: userId })
                                    .select('-createdAt -updatedAt -__v');
    } else {
      return res.status(400).json({ success: false, message: "Invalid result type" });
    }

    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found in database." });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ success: false, message: "Server error fetching result" });
  }
};