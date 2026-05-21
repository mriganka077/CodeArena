import mongoose from 'mongoose';

// =====================================
// Sub-schema: one attempt per question
// =====================================
const questionAttemptSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },

    question: { type: String, required: true },

    type: {
      type: String,
      enum: ['CODING', 'MCQ'],
      required: true,
    },

    // MCQ
    options: [{ type: String }],
    correctAnswer: { type: String },
    selectedAnswer: { type: String },

    // CODING
    code: { type: String, default: '' },
    language: { type: String, default: 'python3' },
    output: { type: String, default: '' },
  },
  { _id: false }
);

// =====================================
// Main schema
// =====================================

const practiceSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    domain: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },

    attempts: {
      type: [questionAttemptSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A session can have at most 10 attempts.',
      },
    },

    aiReview: {
      type: String,
      default: '',
    },

    // =====================================
    // STATS
    // =====================================

    totalQuestions: {
      type: Number,
      default: 10,
    },

    correctMCQ: {
      type: Number,
      default: 0,
    },

    attemptedMCQ: {
      type: Number,
      default: 0,
    },

    attemptedCoding: {
      type: Number,
      default: 0,
    },
    
    correctCoding: {
      type: Number,
      default: 0,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  'PracticeSubmission',
  practiceSubmissionSchema
);