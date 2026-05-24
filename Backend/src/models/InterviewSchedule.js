import mongoose from "mongoose";

const interviewScheduleSchema = new mongoose.Schema({

  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Drive",
    required: true,
  },

  candidates: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  interviewType: {
    type: String,
    enum: ["Technical", "HR", "Design"],
    default: "Technical",
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  difficulty: {
    type: String,
    default: "medium",
  },

  focusAreas: [String],

  instructions: String,

  emailSubject: String,

  emailBody: String,

  timeDurationInMin: Number,

  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
  },

}, { timestamps: true });

export default mongoose.model(
  "InterviewSchedule",
  interviewScheduleSchema
);