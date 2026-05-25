import express from "express";
import { protect } from "../middleware/auth.js";

import InterviewResult from "../models/InterviewResult.js";
import InterviewSchedule from "../models/InterviewSchedule.js";

const router = express.Router();

// ========================================
// SUBMIT INTERVIEW RESULT
// ========================================

router.post(
  "/submit-result",
  protect,

  async (req, res) => {

    try {

      console.log("BODY:", req.body);

      const {

        driveId,
        timeTaken,
        status,
        violations,
        terminationReason,
        transcript,

      } = req.body;

      // ========================================
      // VALIDATION
      // ========================================

      if (!driveId) {

        return res.status(400).json({

          success: false,

          message: "Drive ID missing",

        });

      }

      // ========================================
      // FRONTEND SENDS:
      // InterviewSchedule._id
      // ========================================

      const interviewSchedule =
        await InterviewSchedule.findById(
          driveId
        );

      if (!interviewSchedule) {

        return res.status(404).json({

          success: false,

          message:
            "Interview schedule not found",

        });

      }

      // ========================================
      // SAVE RESULT
      // ========================================

      const result =
        new InterviewResult({

          userId: req.user._id,

          // ========================================
          // IMPORTANT FIX
          // SAVE REAL DRIVE ID
          // ========================================

          driveId:
            interviewSchedule.drive,

          timeTaken,

          status,

          violations,

          terminationReason,

          transcript:
            transcript || [],

        });

      await result.save();

      console.log(
        "INTERVIEW SAVED SUCCESSFULLY"
      );

      res.status(201).json({

        success: true,

        message:
          "Interview result stored successfully",

        result,

      });

    } catch (error) {

      console.log(
        "INTERVIEW SAVE ERROR:"
      );

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to store interview result",

        error:
          error.message,

      });

    }

  }

);

// ========================================
// GET MY RESULTS
// ========================================

router.get(
  "/my-results",
  protect,

  async (req, res) => {

    try {

      const results =
        await InterviewResult.find({

          userId: req.user._id,

        })

        .populate(
          "driveId",
          "hiringPositionName difficulty status"
        );

      res.status(200).json({

        success: true,

        results,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to fetch interview results",

      });

    }

  }

);

export default router;