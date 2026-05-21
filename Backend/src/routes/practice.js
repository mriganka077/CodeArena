import express from 'express';
import { protect } from '../middleware/auth.js';
import PracticeSubmission from '../models/PracticeSubmission.js';
import axios from 'axios';
import { submitCode } from '../api/judge0.js';

const router = express.Router();

// =====================================
// GEMINI HELPER
// =====================================

const callGemini = async (prompt) => {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return (
    res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No response generated.'
  );
};

// =====================================
// LANGUAGE ID MAP
// =====================================

const getLanguageId = (language = '') => {

  const map = {
    python: 71,
    javascript: 63,
    java: 62,
    c: 50,
    'c++': 54,
  };

  return map[
    language.toLowerCase()
  ] || 71;
};

// =====================================
// NORMALIZE OUTPUT
// =====================================

const normalize = (str = '') =>
  str.replace(/\s+/g, ' ').trim();

// =====================================
// POST /api/practice/analyze
// =====================================

router.post(
  '/analyze',
  protect,
  async (req, res) => {

    try {

      const {
        type,
        question,
        options,
        selectedAnswer,
        code,
        output,
        language,
      } = req.body;

      let prompt = '';

      // =====================================
      // CODING ANALYSIS
      // =====================================

      if (type === 'CODING') {

        prompt = `
You are a helpful coding mentor.

# Question
${question}

# Language
${language || 'Unknown'}

# Code
${code || '(empty)'}

# Output
${output || '(no output)'}

Give:
- What is correct
- Hints
- Edge cases

Do NOT give full solution.
Keep it concise.
        `.trim();

      } else {

        // =====================================
        // MCQ ANALYSIS
        // =====================================

        prompt = `
You are a helpful tutor.

# Question
${question}

# Options
${(options || []).join('\n')}

# Selected Answer
${selectedAnswer || '(none)'}

Explain:
- What this tests
- Hint
- Common misconception

Do NOT reveal answer directly.
        `.trim();
      }

      const hint = await callGemini(prompt);

      res.json({
        success: true,
        hint,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message: 'AI analysis failed.',
      });
    }
  }
);

// =====================================
// POST /api/practice/submit
// =====================================

router.post(
  '/submit',
  protect,
  async (req, res) => {

    try {

      const {
        domain,
        difficulty,
        attempts,
      } = req.body;

      // =====================================
      // VALIDATION
      // =====================================

      if (
        !Array.isArray(attempts) ||
        attempts.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'No attempts provided.',
        });
      }

      // =====================================
      // MCQ STATS
      // =====================================

      const correctMCQ = attempts.filter(
        (a) =>
          a.type === 'MCQ' &&
          a.selectedAnswer === a.correctAnswer
      ).length;

      const attemptedMCQ = attempts.filter(
        (a) =>
          a.type === 'MCQ' &&
          a.selectedAnswer
      ).length;

      // =====================================
      // ATTEMPTED CODING
      // =====================================

      const attemptedCoding = attempts.filter(
        (a) =>
          a.type === 'CODING' &&
          a.code?.trim()
      ).length;

      // =====================================
      // CODING EVALUATION
      // =====================================

      let codingCorrect = 0;

      for (const attempt of attempts) {

        if (attempt.type !== 'CODING')
          continue;

        if (!attempt.code?.trim()) {

          attempt.correct = false;

          continue;
        }

        const languageId =
          getLanguageId(
            attempt.language
          );

        const testCases =
          attempt.testCases || [];

        let passedCount = 0;

        for (const tc of testCases) {

          try {

            const result =
              await submitCode(
                attempt.code,
                languageId,
                tc.input
              );

            const actual =
              result.stdout || '';

            const expected =
              tc.expectedOutput || '';

            if (
              normalize(actual) ===
              normalize(expected)
            ) {
              passedCount++;
            }

          } catch (err) {

            console.log(
              'Judge0 Error:',
              err.message
            );
          }
        }

        attempt.passedCount =
          passedCount;

        attempt.totalTestCases =
          testCases.length;

        attempt.correct =
          passedCount ===
          testCases.length;

        if (attempt.correct) {
          codingCorrect++;
        }
      }

      // =====================================
      // SUMMARY FOR AI REVIEW
      // =====================================

      const summaryLines = attempts.map(
        (a, i) => {

          if (a.type === 'MCQ') {

            const correct =
              a.selectedAnswer ===
              a.correctAnswer;

            return `
Q${i + 1} [MCQ]
Question: ${a.question}
Selected: ${a.selectedAnswer || 'none'}
Result: ${correct ? 'Correct' : 'Wrong'}
            `.trim();
          }

          return `
Q${i + 1} [CODING]
Question: ${a.question}
Language: ${a.language}
Passed Test Cases:
${a.passedCount || 0}/${a.totalTestCases || 0}
Result: ${a.correct ? 'Correct' : 'Wrong'}
          `.trim();
        }
      );

      // =====================================
      // AI REVIEW PROMPT
      // =====================================

      const overallPrompt = `
You are an expert technical interviewer.

# Domain
${domain}

# Difficulty
${difficulty}

# Summary
${summaryLines.join('\n\n')}

# Stats
- Correct MCQ: ${correctMCQ}
- Attempted MCQ: ${attemptedMCQ}
- Attempted Coding: ${attemptedCoding}
- Correct Coding: ${codingCorrect}

Give review in format:

## Overall Performance

## Strengths

## Areas to Improve

## Score
X / 10

## Verdict
Excellent | Good | Needs Improvement

Keep it encouraging.
      `.trim();

      // =====================================
      // GENERATE AI REVIEW
      // =====================================

      let aiReview = '';

      try {

        aiReview =
          await callGemini(
            overallPrompt
          );

      } catch (err) {

        console.log(
          'AI Review Error:',
          err.message
        );

        aiReview =
          'AI review unavailable.';
      }

      // =====================================
      // SAVE TO DB
      // =====================================

      const submission =
        await PracticeSubmission.create({

          user: req.user._id,

          domain,

          difficulty,

          attempts,

          aiReview,

          totalQuestions:
            attempts.length,

          correctMCQ,

          attemptedMCQ,

          attemptedCoding,

          correctCoding:
            codingCorrect,
        });

      // =====================================
      // RESPONSE
      // =====================================

      res.status(201).json({
        success: true,

        submission,

        stats: {

          correctMCQ,

          attemptedMCQ,

          attemptedCoding,

          correctCoding:
            codingCorrect,

          total:
            attempts.length,
        },
      });

    } catch (err) {

      console.error(
        'Submit Error:',
        err
      );

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// =====================================
// GET SUBMISSIONS
// =====================================

router.get(
  '/submissions',
  protect,
  async (req, res) => {

    try {

      const submissions =
        await PracticeSubmission.find({
          user: req.user._id,
        }).sort({
          submittedAt: -1,
        });

      res.json({
        success: true,
        submissions,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;