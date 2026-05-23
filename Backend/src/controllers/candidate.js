import User from "../models/User.js";
import Drive from "../models/Drive.js";
import AssessmentResult from "../models/AssessmentResult.js";

export const getAllCandidates = async (req, res) => {

  try {

    const users = await User.find().lean();

    const candidates = await Promise.all(

      users.map(async (user) => {

        // Assessment results
        const results = await AssessmentResult
          .find({ userId: user._id })
          .populate("driveId");

        // Assigned drives
        const assignedDrives = await Drive.find({
          assignedCandidates: user._id,
        });

        // Latest result
        const latestResult = results.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )[0];

        let avgScore = 0;
        let completionRate = 0;
        let drive = "Not Attempted";
        let status = "Active";

        // If attempted any drive
        if (latestResult) {

          avgScore = Math.round(

            results.reduce(
              (sum, r) =>
                sum + (r.score || 0),
              0
            ) / results.length
          );

          drive =
            latestResult.driveId
              ?.hiringPositionName ||
            "Drive Not Found";

          completionRate =
            latestResult.driveId
              ?.totalMarks > 0

              ? Math.round(
                  (
                    latestResult.score /

                    latestResult.driveId
                      .totalMarks
                  ) * 100
                )

              : 0;

          status =
            latestResult.status ===
            "Completed"

              ? "Completed"

              : "On-Hold";
        }

        return {

          ...user,

          avgScore,

          completionRate,

          drive,

          status,

          // Total assigned drives
          totalDrives:
            assignedDrives.length,

          latestScore:
            latestResult?.score || 0,

          latestDriveDate:
            latestResult?.createdAt ||
            null,

          // All assigned drives
          drives: assignedDrives.map(
            (drive) => {

              // Match assessment result
              const result =
                results.find(
                  (r) =>
                    r.driveId?._id?.toString() ===
                    drive._id.toString()
                );

              return {

                id: drive._id,

                name:
                  drive.hiringPositionName,

                score:
                  result?.score || 0,

                status:
                  result?.status ||
                  "Not Attempted",

                date:
                  result?.createdAt ||
                  drive.createdAt,

                driveType:
                  drive.driveType,

                duration:
                  drive.timeDurationInMin,
              };
            }
          ),
        };
      })
    );

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

export const getCandidateById = async (
  req,
  res
) => {

  try {

    const candidate =
      await User.findById(
        req.params.id
      );

    if (!candidate) {

      return res.status(404).json({

        success: false,

        message:
          "Candidate not found",
      });
    }

    // Assessment results
    const results =
      await AssessmentResult
        .find({
          userId: candidate._id,
        })
        .populate("driveId")
        .sort({
          createdAt: -1,
        });

    // Assigned drives
    const assignedDrives =
      await Drive.find({
        assignedCandidates:
          candidate._id,
      });

    res.status(200).json({

      success: true,

      candidate,

      results,

      assignedDrives,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch candidate",
    });
  }
};

export const deleteCandidate = async (
  req,
  res
) => {

  try {

    const candidate =
      await User.findById(
        req.params.id
      );

    if (!candidate) {

      return res.status(404).json({

        success: false,

        message:
          "Candidate not found",
      });
    }

    // Delete results
    await AssessmentResult.deleteMany({
      userId: candidate._id,
    });

    // Remove candidate from drives
    await Drive.updateMany(
      {
        assignedCandidates:
          candidate._id,
      },
      {
        $pull: {
          assignedCandidates:
            candidate._id,
        },
      }
    );

    // Delete candidate
    await User.findByIdAndDelete(
      candidate._id
    );

    return res.status(200).json({

      success: true,

      message:
        "Candidate deleted successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      message:
        "Failed to delete candidate",
    });
  }
};