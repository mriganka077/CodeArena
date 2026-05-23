import Drive from "../models/Drive.js";
import User from "../models/User.js";
import AssessmentResult from "../models/AssessmentResult.js";
import InterviewSchedule from "../models/InterviewSchedule.js";

export const getAllDrives = async (req, res) => {

    try {

        const drives = await Drive.find()
            .populate(
                "assignedCandidates",
                "firstName lastName email picture profilePhoto"
            )
            .sort({ createdAt: -1 })
            .lean();
            

        const formattedDrives = await Promise.all(

            drives.map(async (drive) => {

                const results = await AssessmentResult.find({
                    driveId: drive._id,
                });

                const totalCandidates = results.length;

                const attempted = results.filter(
                    (r) => r.status === "Completed"
                ).length;

                const avgScore =
                    results.length > 0
                        ? Math.round(
                              results.reduce(
                                  (sum, r) => sum + (r.score || 0),
                                  0
                              ) / results.length
                          )
                        : 0;

                const topScore =
                    results.length > 0
                        ? Math.max(
                              ...results.map((r) => r.score || 0)
                          )
                        : 0;

                const completionRate =
                    totalCandidates > 0
                        ? Math.round(
                              (attempted / totalCandidates) * 100
                          )
                        : 0;

                        const now = new Date();

                        let status = drive.status || "Draft";
                        
                        // Only auto-close assessment
                        const assessmentEnded =
                          new Date(drive.assessmentEndDate) < now;
                        
                        // Drive closes only after driveEndDate
                        const driveEnded =
                          new Date(drive.driveEndDate) < now;
                        
                        if (driveEnded) {
                          status = "Completed";
                        } else if (assessmentEnded) {
                          status = "On-Hold";
                        } else {
                          status = "Active";
                        }

                const assignedCount =
                    drive.assignedCandidates?.length || 0;
                        
                        return {
                        
                            _id: drive._id,
                        
                            hiringPositionName: drive.hiringPositionName,
                            assignedCandidates:
                                drive.assignedCandidates || [],
                        
                            tag: drive.driveType,
                        
                            status,
                        
                            visibility:
                                assignedCount > 0
                                    ? "Public"
                                    : "Private",
                        
                                    startDate: drive.assessmentStartDate,

                                    endDate: drive.assessmentEndDate,
                                    
                                    driveEndDate: drive.driveEndDate,
                        
                            totalCandidates,
                        
                            attempted,
                        
                            avgScore,
                        
                            topScore,
                        
                            duration: drive.timeDurationInMin,
                        
                            questionCount:
                                drive.mcqCount + drive.codeCount,
                        
                            mcqCount: drive.mcqCount,
                        
                            codeCount: drive.codeCount,
                        
                            marksPerMcq: drive.mcqMarks,
                        
                            marksPerCode: drive.codeMarks,
                        
                            type: drive.driveType,
                        
                            createdAt: drive.createdAt,
                        
                            difficulty: "Medium",
                        
                            tags: [],
                        
                            completionRate,
                        };
            })
        );

        res.status(200).json({
            success: true,
            drives: formattedDrives,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch drives",
        });
    }
};

export const createDrive = async (req, res) => {

    try {

        const drive = await Drive.create(req.body);

        res.status(201).json({

            success: true,

            drive,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to create drive",
        });
    }
};

export const updateDrive = async (req, res) => {

    try {

        const existingDrive =
            await Drive.findById(req.params.id);

        if (!existingDrive) {

            return res.status(404).json({
                success: false,
                message: "Drive not found",
            });
        }

        if (existingDrive.status === "Completed") {

            return res.status(400).json({
                success: false,
                message: "Drive already ended",
            });
        }

        const updatedDrive =
            await Drive.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

        res.status(200).json({
            success: true,
            drive: updatedDrive,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to update drive",
        });
    }
};

export const getDriveCandidates = async (req, res) => {

    try {

        const { id } = req.params;

        const drive = await Drive.findById(id)
            .populate(
                "assignedCandidates",
                "firstName lastName email picture profilePhoto"
            );

        if (!drive) {

            return res.status(404).json({
                success: false,
                message: "Drive not found",
            });
        }

        const results =
            await AssessmentResult.find({
                driveId: id,
            });

        const candidates =
            drive.assignedCandidates.map((u) => {

                const result =
                    results.find(
                        (r) =>
                            r.userId?.toString() ===
                            u._id.toString()
                    );

                return {

                    _id: u._id,

                    firstName:
                        u.firstName || "",

                    lastName:
                        u.lastName || "",

                    email:
                        u.email || "",

                    picture:
                        u.picture ||
                        u.profilePhoto ||
                        "",

                    score:
                        result?.score ?? null,

                    status:
                        result?.status ||
                        "Assigned",
                };
            });

        res.status(200).json({
            success: true,
            candidates,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch candidates",
        });
    }
};

export const assignCandidatesToDrive = async (req, res) => {

    try {

        const { candidateIds } = req.body;

        const drive =
            await Drive.findById(req.params.id);

        if (!drive) {

            return res.status(404).json({
                success: false,
                message: "Drive not found",
            });
        }
        if (drive.status === "Completed") {

            return res.status(400).json({
                success: false,
                message: "Cannot assign candidates to ended drive",
            });
        }

        const existingIds =
            drive.assignedCandidates.map((id) =>
                id.toString()
            );

        const merged = [
            ...new Set([
                ...existingIds,
                ...candidateIds,
            ]),
        ];

        drive.assignedCandidates = merged;

        await drive.save();

        res.status(200).json({
            success: true,
            message:
                "Candidates assigned successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message:
                "Failed to assign candidates",
        });
    }
};

export const getAllCandidates = async (req, res) => {

    try {

        const candidates = await User.find({
            role: "candidate",
        }).select(
            "firstName lastName email picture profilePhoto"
        );

        res.status(200).json(candidates);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                "Failed to fetch candidates",
        });
    }
};

export const deleteDrive = async (req, res) => {

    try {

        const drive = await Drive.findByIdAndDelete(
            req.params.id
        );

        if (!drive) {

            return res.status(404).json({
                success: false,
                message: "Drive not found",
            });
        }

        res.json({
            success: true,
            message: "Drive deleted successfully",
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const endDrive = async (req, res) => {

    try {

        const drive = await Drive.findByIdAndUpdate(
            req.params.id,
            {
                status: "Completed",
                driveEndDate: new Date(),
            },
            { new: true }
        );

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: "Drive not found",
            });
        }

        res.json({
            success: true,
            message: "Drive ended successfully",
            drive,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const createInterview = async (req, res) => {

    try {

        if (!req.body.candidates?.length) {
            return res.status(400).json({
              success: false,
              message: "Select at least one candidate",
            });
          }
  
        const interview =
            await InterviewSchedule.create({
                ...req.body,
                createdBy: req.user._id,
            });

        await Drive.findByIdAndUpdate(
            req.body.drive,
            {
                $push: {
                    interviews: interview._id,
                },
            }
        );

        res.status(201).json({
            success: true,
            interview,
        });
  
    } catch (err) {
  
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

  export const getMyInterviews = async (
    req,
    res
  ) => {
  
    try {
  
      const interviews =
        await InterviewSchedule.find({
          candidates: req.user._id,
        })
        .populate("drive")
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        interviews,
      });
  
    } catch (error) {
  
      console.log(error);
  
      res.status(500).json({
        success: false,
        message:
          "Failed to fetch interviews",
      });
    }
  };