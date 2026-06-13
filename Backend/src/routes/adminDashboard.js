import express from "express";
import {
  getDashboardStats,
} from "../controllers/adminDashboard.js";
import { adminProtect } from "../middleware/adminProtect.js";

const router = express.Router();

router.get("/stats", getDashboardStats);

export default router;