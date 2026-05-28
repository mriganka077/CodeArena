import express from "express";
import {
    createSession,
    getSessions,
    submitMockInterviewResult,
  } from "../controllers/mockInterviewController.js";
  import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createSession);
router.get("/", getSessions);
router.post(
    "/submit-result",
    submitMockInterviewResult
  );

export default router;