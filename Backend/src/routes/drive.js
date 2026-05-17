import express from "express";

import {
  getAllDrives,
  createDrive,
  updateDrive,
  getDriveCandidates,
  assignCandidatesToDrive,
} from "../controllers/drive.js";

import {
  deleteDrive,
} from "../controllers/drive.js";

const router = express.Router();

router.get("/", getAllDrives);

router.post("/", createDrive);

router.put("/:id", updateDrive);

router.delete("/:id", deleteDrive);


router.get("/:id/candidates", getDriveCandidates);

router.post(
  "/:id/assign-candidates",
  assignCandidatesToDrive
);

export default router;