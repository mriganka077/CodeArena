import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Drive",
    required: true,
  },

  status: {
    type: String,
    enum: ["Completed", "Terminated"],
    required: true,
  },

  timeTaken: {
    type: Number,
    default: 0,
  },

  violations: {

    brightness: {
      type: Number,
      default: 0,
    },

    mask: {
      type: Number,
      default: 0,
    },

    multiPerson: {
      type: Number,
      default: 0,
    },

    noFace: {
      type: Number,
      default: 0,
    },

    tab: {
      type: Number,
      default: 0,
    },

    keyboard: {
      type: Number,
      default: 0,
    },

    fullscreen: {
      type: Number,
      default: 0,
    },

    phone: {
      type: Number,
      default: 0,
    },
  },

  terminationReason: {
    type: String,
    default: "",
  },

  transcript: [
    {
      role: String,
      text: String,
      timestamp: String,
    },
  ],

}, { timestamps: true });

export default mongoose.model(
  "InterviewResult",
  interviewResultSchema
);