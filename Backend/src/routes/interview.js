import express from "express";
import { protect } from "../middleware/auth.js";

import InterviewResult from "../models/InterviewResult.js";
import InterviewSchedule from "../models/InterviewSchedule.js";

import client from "../api/nvidia.js";

const router = express.Router();

import mongoose from "mongoose";

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
        interviewId,
        timeTaken,
        status,
        violations,
        terminationReason,
        transcript,
      } = req.body;

      

      // ========================================
      // CLEAN TRANSCRIPT
      // ========================================

      const cleanedTranscript = [];

      for (const item of transcript || []) {

        if (
          !item.text ||
          !item.text.trim()
        ) continue;

        const text = item.text
          .replace(/\s+/g, " ")
          .trim();

        const last =
          cleanedTranscript[
          cleanedTranscript.length - 1
          ];

        // first message
        if (!last) {

          cleanedTranscript.push({
            role: item.role,
            text,
            timestamp: item.timestamp,
          });

          continue;
        }

        // same role
        if (last.role === item.role) {

          // exact duplicate
          if (last.text === text) {
            continue;
          }

          // streaming partial update
          if (
            text.startsWith(last.text)
          ) {

            last.text = text;

            last.timestamp =
              item.timestamp;

            continue;
          }

          // smaller duplicate chunk
          if (
            last.text.startsWith(text)
          ) {
            continue;
          }
        }

        cleanedTranscript.push({
          role: item.role,
          text,
          timestamp: item.timestamp,
        });
      }

      // ========================================
      // AI EVALUATION USING LLAMA
      // ========================================

      const userMessages =
        cleanedTranscript.filter(
          (m) =>
            m.role === "user" &&
            m.text.trim().length > 3
        );

      let parsed = null;

      // ========================================
      // NO USER RESPONSE
      // ========================================

      if (userMessages.length === 0) {

        parsed = {

          score: 0,

          recommendation: "No Hire",

          feedback:
            "Candidate did not provide any meaningful response.",

          technicalKnowledge: 0,

          communication: 0,

          problemSolving: 0,

          confidence: 0,
        };
      }

      // ========================================
      // RUN AI ONLY IF USER RESPONDED
      // ========================================

      if (!parsed) {

        const transcriptText =

          cleanedTranscript
            .map(
              (m) =>
                `${m.role.toUpperCase()}: ${m.text}`
            )
            .join("\n");

        const prompt = `
          You are an expert AI technical interviewer.

          Analyze the following interview transcript.

          Evaluate the candidate based ONLY on the transcript.

          Rules:
          - If the candidate gives weak, short, irrelevant, or no answers, give LOW scores.
          - If the candidate does not answer technical questions, do NOT give high scores.
          - Be strict and realistic.
          - Do not hallucinate skills not present in transcript.
          - Return ONLY valid JSON.
          - Score range: 0 to 100.
          - Be extremely strict and realistic.
          - Evaluate ONLY the candidate responses.
          - Ignore assistant questions when scoring.
          - If there are NO meaningful user responses, recommendation MUST be "No Hire".
          - If the candidate gives weak, short, irrelevant, or no answers, give LOW scores.
          - If the candidate does not answer technical questions, technicalKnowledge MUST be below 30.
          - If transcript contains only assistant messages, score MUST be below 20.
          - Do not hallucinate skills not present in transcript.
          - Return ONLY valid JSON.
          - Score range: 0 to 100.

          Transcript:
          ${transcriptText}

          Return JSON in this exact structure:

          {
          "score": number,
          "recommendation": "Strong Hire" | "Hire" | "No Hire",
          "feedback": "short feedback",
          "technicalKnowledge": number,
          "communication": number,
          "problemSolving": number,
          "confidence": number
          }
          `;

        const completion =
          await client.chat.completions.create({

            model:
              "meta/llama-3.1-8b-instruct",

            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],

            temperature: 0.2,

            top_p: 0.7,

            max_tokens: 500,
          });

        let aiResponse =
          completion.choices[0]
            .message.content;

        aiResponse = aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        try {

          parsed =
            JSON.parse(aiResponse);

        } catch (error) {

          console.log(
            "AI Parse Error:",
            error
          );

          parsed = {

            score: 50,

            recommendation:
              "No Hire",

            feedback:
              "AI evaluation failed.",

            technicalKnowledge: 50,

            communication: 50,

            problemSolving: 50,

            confidence: 50,
          };
        }
      }
      // ========================================
      // SAVE RESULT
      // ========================================

      console.log("driveId:", driveId);
      console.log("interviewId:", interviewId);
      console.log("transcript:", cleanedTranscript);

      if (!mongoose.Types.ObjectId.isValid(driveId)) {

        return res.status(400).json({
          success: false,
          message: "Invalid driveId",
        });
      }
      
      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      
        return res.status(400).json({
          success: false,
          message: "Invalid interviewId",
        });
      }

      let result =
        await InterviewResult.create({

          userId: req.user.id,

          driveId: new mongoose.Types.ObjectId(driveId),

          interviewId:
            new mongoose.Types.ObjectId(
              interviewId
            ),

          timeTaken,

          status,

          violations,

          terminationReason,

          transcript: cleanedTranscript,

          score: parsed.score,

          recommendation:
            parsed.recommendation,

          feedback:
            parsed.feedback,

          technicalKnowledge:
            parsed.technicalKnowledge,

          communication:
            parsed.communication,

          problemSolving:
            parsed.problemSolving,

          confidence:
            parsed.confidence,
        });

      result =
        await InterviewResult.findById(
          result._id
        )

        .populate(
          "driveId",
          "hiringPositionName difficulty status"
        )
    
        .populate(
          "interviewId"
        )
    
        .populate(
          "userId",
          "firstName lastName"
        );

      res.status(201).json({

        success: true,

        result,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message:
          "Server error",
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