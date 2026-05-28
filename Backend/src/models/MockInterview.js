import mongoose from "mongoose";

const mockInterviewSchema =
  new mongoose.Schema(
    {

      userId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },

      domain: {
        type: String,
        required: true,
      },

      category: {
        type: String,
        required: true,
      },

      startedAt: {
        type: Date,
        default: Date.now,
      },

      timeTaken: {
        type: Number,
        default: 0,
      },

      status: {
        type: String,

        enum: [
          "started",
          "completed",
          "abandoned",
        ],

        default: "started",
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

      recommendation: {
        type: String,
        default: "Pending",
      },
    },

    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "MockInterview",
  mockInterviewSchema
);