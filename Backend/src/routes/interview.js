import express from "express";
import { protect } from "../middleware/auth.js";

import InterviewResult from "../models/InterviewResult.js";

const router = express.Router();

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
  
        if (!driveId) {
  
          return res.status(400).json({
            success: false,
            message: "Drive ID missing",
          });
        }
  
        const result = new InterviewResult({
  
          userId: req.user._id,
  
          driveId,
  
          timeTaken,
  
          status,
  
          violations,
  
          terminationReason,
  
          transcript: transcript || [],
        });
  
        await result.save();
  
        console.log("INTERVIEW SAVED");
  
        res.status(201).json({
          success: true,
          message:
            "Interview result stored successfully",
        });
  
      } catch (error) {
  
        console.log("INTERVIEW SAVE ERROR:");
        console.log(error);
  
        res.status(500).json({
          success: false,
          message:
            "Failed to store interview result",
          error: error.message,
        });
      }
    }
  );

  router.get(
    "/my-results",
    protect,
    async (req, res) => {
  
      try {
  
        const results =
          await InterviewResult.find({
            userId: req.user._id,
          });
  
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