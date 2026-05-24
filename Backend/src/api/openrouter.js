import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ========================================
// NVIDIA CLIENT
// ========================================

const nvidia = axios.create({

  baseURL:
    "https://integrate.api.nvidia.com/v1",

  headers: {

    Authorization:
      `Bearer ${process.env.NVIDIA_API_KEY}`,

    "Content-Type":
      "application/json",

  },

});

// ========================================
// LANGUAGE DETECTION
// ========================================

const detectLanguage = (
  domain = ""
) => {

  const text =
    domain.toLowerCase();

  if (
    text.includes("typescript") ||
    /\bts\b/.test(text)
  ) {
    return "TypeScript";
  }

  if (
    text.includes("frontend") ||
    text.includes("react") ||
    text.includes("javascript") ||
    /\bjs\b/.test(text) ||
    text.includes("node")
  ) {
    return "JavaScript";
  }

  if (
    text.includes("python") ||
    text.includes("ml") ||
    text.includes("ai")
  ) {
    return "Python";
  }

  if (
    text.includes("java") &&
    !text.includes("javascript")
  ) {
    return "Java";
  }

  if (
    text.includes("c++") ||
    text.includes("cpp")
  ) {
    return "C++";
  }

  if (
    text.includes("c#") ||
    text.includes(".net")
  ) {
    return "C#";
  }

  if (
    text.includes("php") ||
    text.includes("laravel")
  ) {
    return "PHP";
  }

  if (
    text.includes("go") ||
    text.includes("golang")
  ) {
    return "Go";
  }

  return "Python";

};

// ========================================
// STARTER CODE
// ========================================

const getStarterCode = (
  language
) => {

  switch (language) {

    // ====================================
    // PYTHON
    // ====================================

    case "Python":

      return `
import sys

def solve():

    input_data = sys.stdin.read().strip()

    # Write your solution here

solve()
`;

    // ====================================
    // JAVASCRIPT
    // ====================================

    case "JavaScript":

      return `
function solve(input) {

}

const fs = require("fs");

const input =
  fs.readFileSync(0, "utf8").trim();

solve(input);
`;

    // ====================================
    // TYPESCRIPT
    // ====================================

    case "TypeScript":

      return `
function solve(input: string): void {

}

process.stdin.resume();

process.stdin.setEncoding("utf8");

let data = "";

process.stdin.on(
  "data",
  chunk => {
    data += chunk;
  }
);

process.stdin.on(
  "end",
  () => {
    solve(data.trim());
  }
);
`;

    // ====================================
    // JAVA
    // ====================================

    case "Java":

      return `
import java.util.*;

public class Main {

    public static void solve() {

        Scanner sc =
          new Scanner(System.in);

    }

    public static void main(
      String[] args
    ) {

        solve();

    }
}
`;

    // ====================================
    // C++
    // ====================================

    case "C++":

      return `
#include <iostream>
#include <vector>

using namespace std;

void solve() {

}

int main() {

    solve();

    return 0;

}
`;

    // ====================================
    // C#
    // ====================================

    case "C#":

      return `
using System;

class Program {

    static void Solve() {

    }

    static void Main() {

        Solve();

    }

}
`;

    // ====================================
    // PHP
    // ====================================

    case "PHP":

      return `
<?php

function solve($input) {

}

$input =
  trim(
    stream_get_contents(STDIN)
  );

solve($input);

?>
`;

    // ====================================
    // GO
    // ====================================

    case "Go":

      return `
package main

import (
    "bufio"
    "fmt"
    "os"
)

func solve(input string) {

}

func main() {

    reader :=
      bufio.NewReader(os.Stdin)

    input, _ :=
      reader.ReadString('\\n')

    solve(input)

}
`;

    default:

      return `
import sys

def solve():

    input_data =
      sys.stdin.read().strip()

    # Write your solution here

solve()
`;

  }

};

// ========================================
// SANITIZE STARTER CODE
// ========================================

const sanitizeStarterCode = (
  code = "",
  language = "Python"
) => {

  if (language !== "Python") {
    return code;
  }

  const lines =
    code.split("\n");

  const cleaned =
    lines.filter((line) => {

      const trimmed =
        line.trim();

      // remove example execution
      if (
        trimmed.startsWith("print(")
      ) {
        return false;
      }

      // remove hardcoded arrays
      if (
        trimmed.startsWith("arr =") ||
        trimmed.startsWith("nums =") ||
        trimmed.startsWith("input =")
      ) {
        return false;
      }

      // remove comments
      if (
        trimmed.includes("Example") ||
        trimmed.includes("Output")
      ) {
        return false;
      }

      return true;

    });

  return cleaned.join("\n");

};

// ========================================
// VERIFY TEST CASES
// ========================================

const verifyQuestion = (
  question
) => {

  try {

    const title =
      question.question
        ?.toLowerCase() || "";

    // ====================================
    // MAXIMUM SUBARRAY FIX
    // ====================================

    if (
      title.includes(
        "maximum subarray"
      )
    ) {

      const fixCases = (
        testCases = []
      ) => {

        return testCases.map(
          (tc) => {

            if (
              tc.input ===
              "1 2 -3 4 -1 2 1 -5 4"
            ) {

              return {
                ...tc,
                expectedOutput: "7",
              };

            }

            return tc;

          }
        );

      };

      question.visibleTestCases =
        fixCases(
          question.visibleTestCases
        );

      question.hiddenTestCases =
        fixCases(
          question.hiddenTestCases
        );

    }

    return question;

  } catch {

    return question;

  }

};

// ========================================
// REMOVE DUPLICATES
// ========================================

const removeDuplicateQuestions = (
  questions = []
) => {

  return questions.filter(
    (
      question,
      index,
      self
    ) => {

      const normalized =
        question.question
          ?.trim()
          ?.toLowerCase();

      return (
        index ===
        self.findIndex(
          (q) =>
            q.question
              ?.trim()
              ?.toLowerCase() ===
            normalized
        )
      );

    }
  );

};

// ========================================
// CLEAN RAW JSON
// ========================================

const cleanJsonResponse = (
  raw = ""
) => {

  raw = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  raw = raw.replace(
    /,\s*}/g,
    "}"
  );

  raw = raw.replace(
    /,\s*]/g,
    "]"
  );

  return raw;

};

// ========================================
// VALIDATE QUESTIONS
// ========================================

const validateQuestions = (
  questions = [],
  type
) => {

  if (!Array.isArray(questions)) {
    return [];
  }

  // ====================================
  // CODING
  // ====================================

  if (type === "CODING") {

    const cleanedQuestions =
      questions.map((q) => {

        const cleaned = {

          ...q,

          starterCode:
            sanitizeStarterCode(
              q.starterCode,
              q.language
            ),

        };

        return verifyQuestion(
          cleaned
        );

      });

    return cleanedQuestions.filter(

      (q) =>

        q.question &&
        q.starterCode &&
        q.language &&

        Array.isArray(
          q.visibleTestCases
        ) &&

        q.visibleTestCases
          .length > 0 &&

        Array.isArray(
          q.hiddenTestCases
        ) &&

        q.hiddenTestCases
          .length > 0

    );

  }

  // ====================================
  // MCQ
  // ====================================

  return questions.filter(

    (q) =>

      q.question &&

      Array.isArray(
        q.options
      ) &&

      q.options.length === 4 &&

      q.answer

  );

};

// ========================================
// CREATE PROMPT
// ========================================

const createPrompt = ({
  domain,
  difficulty,
  type,
  count,
  language,
  starterCode,
  aiPrompt,
}) => {

  // ====================================
  // CODING PROMPT
  // ====================================

  if (type === "CODING") {

    return `
${aiPrompt || ""}

Generate ${count} unique ${difficulty} coding interview questions for ${domain}.

STRICT RULES:

- Return ONLY valid JSON array
- No markdown
- No explanations
- Questions must be unique
- Use ${language}
- Escape newlines properly

STRICT CODING RULES:

- starterCode MUST use stdin/stdout
- starterCode MUST NOT contain example inputs
- starterCode MUST NOT contain hardcoded print statements
- starterCode MUST NOT contain hardcoded outputs
- Problems MUST be Judge0 compatible
- expectedOutput MUST be mathematically correct
- Verify every testcase before returning JSON

Each coding question MUST contain:

1. question
2. starterCode
3. language
4. visibleTestCases
5. hiddenTestCases

IMPORTANT:

- visibleTestCases MUST have at least 2 test cases
- hiddenTestCases MUST have at least 2 test cases
- expectedOutput MUST always be STRING
- input MUST always be STRING

VALID FORMAT:

[
  {
    "question":
      "Find Maximum Subarray Sum",

    "starterCode":
      "${starterCode
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"')}",

    "language":
      "${language}",

    "visibleTestCases": [
      {
        "input":
          "1 2 -3 4 -1 2 1 -5 4",

        "expectedOutput":
          "7"
      },
      {
        "input":
          "-1 -2 -3",

        "expectedOutput":
          "-1"
      }
    ],

    "hiddenTestCases": [
      {
        "input":
          "1 2 3 4",

        "expectedOutput":
          "10"
      },
      {
        "input":
          "-5 -1 -8",

        "expectedOutput":
          "-1"
      }
    ]
  }
]
`;

  }

  // ====================================
  // MCQ PROMPT
  // ====================================

  return `
${aiPrompt || ""}

Generate ${count} unique ${difficulty} MCQ interview questions for ${domain}.

STRICT RULES:

- Return ONLY valid JSON array
- No markdown
- No explanations
- Every question MUST contain exactly 4 options
- answer MUST contain FULL correct option text
- Do NOT return indexes
- Do NOT return A/B/C/D

VALID FORMAT:

[
  {
    "question":
      "What is Python?",

    "options": [
      "Language",
      "Database",
      "OS",
      "Browser"
    ],

    "answer":
      "Language"
  }
]
`;

};

// ========================================
// GENERATE BATCH
// ========================================

const generateBatch = async (
  {
    prompt,
    type,
  },
  retries = 2
) => {

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {

    try {

      const response =
        await nvidia.post(
          "/chat/completions",
          {

            model:
              "meta/llama-3.1-8b-instruct",

            messages: [

              {
                role: "system",

                content:
                  "Return ONLY valid JSON array. No markdown. No explanations.",
              },

              {
                role: "user",

                content: prompt,
              },

            ],

            max_tokens: 4096,

            temperature: 0.3,

            top_p: 0.8,

            stream: false,

            chat_template_kwargs: {
              enable_thinking: false,
            },

          }
        );

      let raw =
        response.data?.choices?.[0]
          ?.message?.content || "[]";

      console.log(
        "RAW RESPONSE:"
      );

      console.log(raw);

      raw =
        cleanJsonResponse(raw);

      // ====================================
      // FIX STARTER CODE ESCAPING
      // ====================================

      raw = raw.replace(
        /"starterCode"\s*:\s*"([\s\S]*?)"/g,
        (match, code) => {

          const escaped =
            JSON.stringify(code)
              .slice(1, -1);

          return `"starterCode":"${escaped}"`;

        }
      );

      const parsed =
        JSON.parse(raw);

      const validated =
        validateQuestions(
          parsed,
          type
        );

      if (
        validated.length > 0
      ) {

        return validated;

      }

    } catch (error) {

      console.log(
        `Batch attempt ${
          attempt + 1
        } failed`
      );

      console.log(
        error.response?.data ||
        error.message
      );

      if (attempt === retries) {
        return [];
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1000 * (attempt + 1)
          )
      );

    }

  }

  return [];

};

// ========================================
// MAIN GENERATOR
// ========================================

export const generateQuestions =
  async ({
    domain,
    difficulty = "Medium",
    type = "MCQ",
    count = 5,
    aiPrompt = "",
  }) => {

    try {

      const language =
        detectLanguage(domain);

      const starterCode =
        getStarterCode(language);

      const batchSize = 2;

      const totalBatches =
        Math.ceil(
          count / batchSize
        );

      const requests = [];

      for (
        let i = 0;
        i < totalBatches;
        i++
      ) {

        const remaining =
          count - i * batchSize;

        const currentBatchSize =
          Math.min(
            batchSize,
            remaining
          );

        const prompt =
          createPrompt({

            domain,

            difficulty,

            type,

            count:
              currentBatchSize,

            language,

            starterCode,

            aiPrompt,

          });

        requests.push(

          generateBatch({
            prompt,
            type,
          })

        );

      }

      const results =
        await Promise.all(
          requests
        );

      const questions =
        results.flat();

      const uniqueQuestions =
        removeDuplicateQuestions(
          questions
        );

      return uniqueQuestions.slice(
        0,
        count
      );

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

      throw new Error(
        "Question generation failed"
      );

    }

  };