import mongoose from "mongoose";

const mockInterviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    domain: { type: String, required: true },
    category: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["started", "abandoned"], default: "started" },
  },
  { timestamps: true }
);

export default mongoose.model("MockInterview", mockInterviewSchema);