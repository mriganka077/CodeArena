import mongoose from "mongoose";

const driveSchema = new mongoose.Schema({
  driveId: { type: String, required: true, unique: true },

  hiringPositionName: { type: String, required: true },

  // Assessment timing
  assessmentStartDate: {
    type: Date,
    required: true,
  },

  assessmentEndDate: {
    type: Date,
    required: true,
  },

  // Drive timing
  driveEndDate: {
    type: Date,
    default: null,
  },

  driveType: {
    type: String,
    enum: ["Assessment", "Interview"],
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate",
  },

  status: {
    type: String,
    enum: ["Active", "Completed", "On-Hold", "Draft"],
    default: "Active",
  },

  timeDurationInMin: {
    type: Number,
    required: true,
  },

  mcqCount: {
    type: Number,
    default: 0,
  },

  codeCount: {
    type: Number,
    default: 0,
  },

  mcqMarks: {
    type: Number,
    default: 0,
  },

  codeMarks: {
    type: Number,
    default: 0,
  },

  totalMarks: {
    type: Number,
    default: 0,
  },

  assignedCandidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  interviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSchedule",
    },
  ],

}, { timestamps: true });

export default mongoose.model("Drive", driveSchema);