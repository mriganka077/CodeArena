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
      testCases
    } = req.body;

    if (
      !testCases ||
      testCases.length === 0
    ) {

      return res.status(400).json({
        success: false,
        message: "No test cases provided"
      });

    }

    const language_id =
      LANGUAGE_IDS[language];

    if (!language_id) {

      return res.status(400).json({
        success: false,
        message: "Unsupported language"
      });

    }

    const results = [];

    for (const tc of testCases) {

      const result =
        await submitCode({

          source_code: code,

          language_id,

          stdin: tc.input || "",

        });

      const actualOutput =
        (
          result.stdout || ""
        ).trim();

      const expectedOutput =
        (
          tc.expectedOutput || ""
        ).trim();

      const passed =
        actualOutput === expectedOutput;

      results.push({

        input: tc.input,

        expected: expectedOutput,

        actual: actualOutput,

        passed,

      });

    }

    const accepted =
      results.every(
        (r) => r.passed
      );

    return res.json({

      success: true,

      accepted,

      results,

    });

  } catch (error) {

    console.error(
      "Submit route error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Submission failed",

    });

  }

});

export default router;