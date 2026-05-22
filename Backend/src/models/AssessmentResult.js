import mongoose from "mongoose";

const assessmentResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
  score: { type: Number, default: 0 }, 
  isPass: { type: Boolean }, 
  timeTaken: { type: Number, default: 0 },
  status: { type: String, enum: ["Completed", "Terminated"], required: true },
  violations: {
    brightness: { type: Number, default: 0 },
    mask: { type: Number, default: 0 },
    multiPerson: { type: Number, default: 0 },
    noFace: { type: Number, default: 0 },
    tab: { type: Number, default: 0 },
    keyboard: { type: Number, default: 0 }
  },
  terminationReason: { type: String, default: "" }
}, { timestamps: true });

assessmentResultSchema.pre("save", async function () {

  const Drive = mongoose.model("Drive");
  const driveInfo = await Drive.findById(this.driveId);

  if (!driveInfo) {
    throw new Error("Cannot save result: Associated Drive not found.");
  }

  const passingThreshold = driveInfo.totalMarks * 0.70;

  this.isPass = this.score >= passingThreshold;
});

export default mongoose.model("AssessmentResult", assessmentResultSchema);