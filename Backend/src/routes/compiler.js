import express from "express";
import { submitCode, LANGUAGE_IDS } from "../api/judge0.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    const { code, language, input } = req.body;

    const language_id = LANGUAGE_IDS[language];

    if (!language_id) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language",
      });
    }

    const result = await submitCode({
      source_code: code,
      language_id,
      stdin: input,
    });

    return res.json({
      success: true,
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        status: result.status,
        time: result.time,
        memory: result.memory,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Code execution failed",
    });
  }
});

router.post("/submit", async (req, res) => {
  try {

    const {
      code,
      language,
      testCases,
    } = req.body;

    const language_id =
      LANGUAGE_IDS[language];

    if (!language_id) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language",
      });
    }

    const normalize = (str = "") =>
      str.replace(/\s+/g, " ").trim();

    const results = [];

    for (const tc of testCases) {

      const result = await submitCode({
        source_code: code,
        language_id,
        stdin: tc.input,
      });

      const actual =
        result.stdout || "";

      const expected =
        tc.expectedOutput || "";

      const passed =
        normalize(actual) ===
        normalize(expected);

      results.push({
        input: tc.input,
        expected,
        actual,
        passed,
        stderr: result.stderr,
        compile_output:
          result.compile_output,
        status: result.status,
      });
    }

    const passedCount =
      results.filter(r => r.passed).length;

    const accepted =
      passedCount === results.length;

    return res.json({
      success: true,
      accepted,
      passedCount,
      total: results.length,
      results,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Judge failed",
    });
  }
});

export default router;