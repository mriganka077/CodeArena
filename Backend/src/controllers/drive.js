import Drive from "../models/Drive.js";
import User from "../models/User.js";
import AssessmentResult from "../models/AssessmentResult.js";
import InterviewSchedule from "../models/InterviewSchedule.js";
import InterviewResult from "../models/InterviewResult.js";


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
                    drive.assessmentEndDate
                        ? new Date(drive.assessmentEndDate) < now
                        : false;

                const driveEnded =
                    drive.driveEndDate
                        ? new Date(drive.driveEndDate) < now
                        : false;

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

                    interviews:
                        drive.interviews || [],

                    interviewStartDate:
                        drive.interviews?.length > 0
                            ? drive.interviews[0]?.startDate
                            : null,

                    interviewEndDate:
                        drive.interviews?.length > 0
                            ? drive.interviews[0]?.endDate
                            : null,

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

                    assessmentStartDate:
                        drive.assessmentStartDate,

                    assessmentEndDate:
                        drive.assessmentEndDate,

                    driveEndDate:
                        drive.driveEndDate,

                    totalCandidates,

                    attempted,

                    avgScore,

                    topScore,

                    duration:
                        drive.timeDurationInMin,

                    questionCount:
                        drive.mcqCount + drive.codeCount,

                    mcqCount: drive.mcqCount,

                    codeCount: drive.codeCount,

                    marksPerMcq: drive.mcqMarks,

                    marksPerCode: drive.codeMarks,

                    totalMarks: drive.totalMarks,

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

        // ==========================
        // FETCH ASSESSMENT RESULTS
        // ==========================

        const assessmentResults =
            await AssessmentResult.find({

                driveId: id,

            });

        // ==========================
        // FETCH INTERVIEW RESULTS
        // ==========================

        const interviewResults =
            await InterviewResult.find({

                driveId: id,

            });

        // ==========================
        // BUILD CANDIDATE DATA
        // ==========================

        const candidates =
            drive.assignedCandidates.map((u) => {

                // Assessment
                const assessment =
                    assessmentResults.find(

                        (r) =>

                            r.userId?.toString() ===
                            u._id.toString()
                    );

                // Interview
                const interview =
                    interviewResults.find(
                        (r) =>
                            r.userId?.toString() ===
                            u._id.toString()

                            &&

                            r.driveId?.toString() ===
                            id.toString()
                    );

                // Total Violations
                const totalInterviewViolations =
                    interview?.violations

                        ? Object.values(
                            interview.violations
                        ).reduce(
                            (a, b) => a + b,
                            0
                        )

                        : 0;

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

                    // ==========================
                    // ASSESSMENT
                    // ==========================

                    score:
                        assessment?.score ?? null,

                    percentage:
                        assessment?.percentage ?? null,

                    totalMarks:
                        drive.totalMarks ?? null,

                    status:
                        assessment?.status ||
                        "Assigned",

                    // ==========================
                    // INTERVIEW
                    // ==========================

                    interviewStatus:
                        interview?.status || null,

                    interviewTimeTaken:
                        interview?.timeTaken || 0,

                    // AI Interview Score
                    interviewScore:
                        interview?.score || 0,

                    // Interview Questions Count
                    interviewQuestionCount:
                        interview?.transcript?.length || 0,

                    // Interview Recommendation
                    interviewRecommendation:
                        interview?.recommendation || "No Hire",

                    // Assessment Result
                    assessmentResult:
                        assessment?.percentage >= 40
                            ? "Pass"
                            : "Fail",

                    interviewCreatedAt:
                        interview?.createdAt || null,

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

export const getAllAdminInterviews = async (
    req,
    res
) => {

    try {

        const interviews =
            await InterviewSchedule.find()

                .populate(
                    "drive",
                    `
            hiringPositionName
            difficulty
            driveType
            `
                )

                .populate(
                    "candidates",
                    `
            firstName
            lastName
            email
            picture
            profilePhoto
            `
                )

                .sort({ createdAt: -1 });

        const interviewResults =
            await InterviewResult.find();

        const assessmentResults =
            await AssessmentResult.find();

        const formatted =
            interviews.flatMap((iv) =>

                iv.candidates.map((candidate) => {

                    // ==========================
                    // FIND INTERVIEW RESULT
                    // ==========================

                    const interviewResult =
                        interviewResults.find(

                            (r) =>

                                r.userId?.toString() ===
                                candidate._id.toString()

                                &&

                                r.driveId?.toString() ===
                                iv.drive?._id?.toString()

                        );

                    // ==========================
                    // FIND ASSESSMENT RESULT
                    // ==========================

                    const assessmentResult =
                        assessmentResults.find(

                            (r) =>

                                r.userId?.toString() ===
                                candidate._id.toString()

                                &&

                                r.driveId?.toString() ===
                                iv.drive?._id?.toString()

                        );

                    // ==========================
                    // TOTAL VIOLATIONS
                    // ==========================

                    const totalViolations =
                        interviewResult?.violations

                            ? Object.values(
                                interviewResult.violations
                            ).reduce(
                                (a, b) => a + b,
                                0
                            )

                            : 0;

                    return {

                        id: iv._id,

                        candidate:
                            `${candidate.firstName || ""}
                         ${candidate.lastName || ""}`,

                        avatar:
                            `${candidate.firstName?.[0] || ""}
                         ${candidate.lastName?.[0] || ""}`,

                        candidateImage:
                            candidate.picture ||
                            candidate.profilePhoto ||
                            "",

                        email:
                            candidate.email,

                        role:
                            iv.drive?.hiringPositionName ||
                            "Interview",

                        drive:
                            iv.drive?.hiringPositionName ||
                            "Interview Drive",

                        scheduledAt:
                            iv.startDate,

                        endDate:
                            iv.endDate,

                        duration:
                            iv.timeDurationInMin || 0,

                        // ==========================
                        // INTERVIEW STATUS
                        // ==========================

                        status:
                            interviewResult?.status ||
                            iv.status,

                        type:
                            iv.interviewType,

                        round:
                            "AI Interview",

                        difficulty:
                            iv.difficulty || "medium",

                        focusAreas:
                            iv.focusAreas || [],

                        instructions:
                            iv.instructions || "",

                        emailSubject:
                            iv.emailSubject || "",

                        emailBody:
                            iv.emailBody || "",

                        tags:
                            iv.focusAreas || [],

                        // ==========================
                        // REAL INTERVIEW DATA
                        // ==========================

                        transcript:
                            interviewResult?.transcript || [],

                        transcriptCount:
                            interviewResult?.transcript?.length || 0,

                        timeTaken:
                            interviewResult?.timeTaken || 0,

                        violations:
                            interviewResult?.violations || {},

                        violationCount:
                            totalViolations,

                        terminationReason:
                            interviewResult?.terminationReason || "",

                        // ==========================
                        // ASSESSMENT
                        // ==========================

                        assessmentScore:
                            assessmentResult?.percentage || 0,

                        score:
                            assessmentResult?.score || 0,

                        percentage:
                            assessmentResult?.percentage || 0,

                        rank: 0,

                        recommendation: null,

                        notes: "",
                    };
                })
            );

        res.status(200).json({
            success: true,
            interviews: formatted,
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