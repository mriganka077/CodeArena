import mongoose from "mongoose";

const assessmentResultSchema = new mongoose.Schema(

  {

    // ==========================
    // USER + DRIVE
    // ==========================

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

    // ==========================
    // SCORE
    // ==========================

    score: {
      type: Number,
      default: 0,
    },

    isPass: {
      type: Boolean,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    timeTaken: {
      type: Number,
      default: 0,
    },

    // ==========================
    // STATUS
    // ==========================

    status: {
      type: String,
      enum: ["Completed", "Terminated"],
      required: true,
    },

    // ==========================
    // VIOLATIONS
    // ==========================

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

      noise: {
        type: Number,
        default: 0,
      },

      phone: {
        type: Number,
        default: 0,
      },

    },

    // ==========================
    // MCQ ANSWERS
    // ==========================

    mcqAnswers: {
      type: Object,
      default: {},
    },

    // ==========================
    // CODING ANSWERS
    // ==========================

    codingAnswers: {
      type: Object,
      default: {},
    },

    // ==========================
    // TERMINATION
    // ==========================

    terminationReason: {
      type: String,
      default: "",
    },

  },

  {
    timestamps: true,
  }

);

// ==========================
// PASS / FAIL LOGIC
// ==========================

assessmentResultSchema.pre("save", async function () {

  try {

    const Drive =
      mongoose.model("Drive");

    const driveInfo =
      await Drive.findById(
        this.driveId
      );

    if (!driveInfo) {

      throw new Error(
        "Cannot save result: Associated Drive not found."
      );

    }

    // ==========================
    // CALCULATE PERCENTAGE
    // ==========================

    this.percentage =

      driveInfo.totalMarks > 0

        ? Number(

            (
              (
                this.score /
                driveInfo.totalMarks
              ) * 100
            ).toFixed(2)

          )

        : 0;

    // ==========================
    // PASS / FAIL
    // ==========================

    const passingThreshold =

      driveInfo.totalMarks * 0.60;

    this.isPass =

      this.score >= passingThreshold;

  } catch (error) {

    console.error(
      "Assessment pre-save error:",
      error.message
    );

    throw error;

  }

});

export default mongoose.model(
  "AssessmentResult",
  assessmentResultSchema
);