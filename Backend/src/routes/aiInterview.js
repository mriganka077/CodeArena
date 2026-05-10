import express from "express";

import {
  startAIInterview,
  evaluateAIAnswer,
} from "../controllers/aiInterview.js";

const router = express.Router();

router.post(
  "/start",
  startAIInterview
);

router.post(
  "/evaluate",
  evaluateAIAnswer
);

export default router;