import {
    submitCode,
    LANGUAGE_IDS
  } from "../api/judge0.js";
  
  export const verifyQuestion =
    async (question) => {
  
      try {
  
        const normalizedLanguage =
          question.language
            ?.toLowerCase()
            ?.trim();
  
        const language_id =
          LANGUAGE_IDS[
            normalizedLanguage
          ];
  
        if (!language_id) {
  
          return {
            valid: false,
            reason:
              "Unsupported language",
          };
  
        }
  
        const allTests = [
  
          ...(
            question.visibleTestCases ||
            []
          ),
  
          ...(
            question.hiddenTestCases ||
            []
          ),
  
        ];
  
        if (
          allTests.length === 0
        ) {
  
          return {
            valid: false,
            reason:
              "No testcases",
          };
  
        }
  
        // =========================
        // FIX PYTHON IMPORTS
        // =========================
  
        let code =
          question.solutionCode;
  
        if (
          question.language ===
            "Python" &&
  
          code.includes("sys.") &&
  
          !code.includes(
            "import sys"
          )
        ) {
  
          code =
            "import sys\n" + code;
  
        }
  
        // =========================
        // RUN EVERY TESTCASE
        // =========================
  
        for (const tc of allTests) {
  
          const result =
            await submitCode({
  
              source_code:
                code,
  
              language_id,
  
              stdin:
                tc.input || "",
  
            });
  
          if (
            result.compile_output
          ) {
  
            return {
  
              valid: false,
  
              reason:
                "Compilation Error",
  
              error:
                result.compile_output,
  
            };
  
          }
  
          if (result.stderr) {
  
            return {
  
              valid: false,
  
              reason:
                "Runtime Error",
  
              error:
                result.stderr,
  
            };
  
          }
  
          const normalize = (
            str = ""
          ) =>
  
            str
              .replace(/\r/g, "")
              .trim();
  
          const actual =
            normalize(
              result.stdout
            );
  
          const expected =
            normalize(
              tc.expectedOutput
            );
  
          // =========================
          // FAIL IF OUTPUT MISMATCH
          // =========================
  
          if (
            actual !== expected
          ) {
  
            return {
  
              valid: false,
  
              reason:
                "Testcase mismatch",
  
              testcase: {
  
                input:
                  tc.input,
  
                expected,
  
                actual,
  
              },
  
            };
  
          }
  
        }
  
        // =========================
        // ALL TESTS PASSED
        // =========================
  
        return {
  
          valid: true,
  
        };
  
      } catch (error) {
  
        return {
  
          valid: false,
  
          reason:
            error.message,
  
        };
  
      }
  
    };