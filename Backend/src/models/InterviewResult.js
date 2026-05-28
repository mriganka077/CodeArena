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

  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewSchedule",
    required: true,
  },

  status: {
    type: String,
    enum: [
      "started",
      "completed",
      "abandoned",
    ],
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
      timestamp: {
        type: Date,
      },
    },
    
  ],

  score: {
    type: Number,
    default: 0,
  },
  
  recommendation: {
    type: String,
    enum: ["Strong Hire", "Hire", "No Hire"],
    default: "No Hire",
  },
  
  feedback: {
    type: String,
    default: "",
  },
  technicalKnowledge: {
    type: Number,
    default: 0,
  },
  
  communication: {
    type: Number,
    default: 0,
  },
  
  problemSolving: {
    type: Number,
    default: 0,
  },
  
  confidence: {
    type: Number,
    default: 0,
  },

}, { timestamps: true });

export default mongoose.model(
  "InterviewResult",
  interviewResultSchema
);