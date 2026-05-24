import express from "express";
import { protect } from "../middleware/auth.js";

import {
  getAllDrives,
  createDrive,
  updateDrive,
  getDriveCandidates,
  assignCandidatesToDrive,
  deleteDrive,
  endDrive,
  createInterview,
  getMyInterviews,
  getAllAdminInterviews,
} from "../controllers/drive.js";

const router = express.Router();

router.get("/", getAllDrives);

router.post("/", createDrive);

router.put("/:id", updateDrive);

router.delete("/:id", deleteDrive);

router.get("/:id/candidates", getDriveCandidates);

router.post(
  "/schedule-interview",
  protect,
  createInterview
);

router.post(
  "/:id/assign-candidates",
  assignCandidatesToDrive
);

router.get(
  "/my-interviews",
  protect,
  getMyInterviews
);

router.put("/:id/end-drive", endDrive);

router.get(
  "/admin",
  protect,
  getAllAdminInterviews
);

export default router;