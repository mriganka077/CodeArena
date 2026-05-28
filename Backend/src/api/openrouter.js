import axios from "axios";
import dotenv from "dotenv";

import {
  verifyQuestion
} from "../utils/verifyQuestion.js";

dotenv.config();

// ========================================
// GEMINI CLIENT
// ========================================

const openrouter = axios.create({

  baseURL:
    "https://openrouter.ai/api/v1",

  headers: {

    Authorization:
      `Bearer ${process.env.OPENROUTER_API_KEY}`,

    "Content-Type":
      "application/json",

    "HTTP-Referer":
      "http://localhost:5173",

    "X-Title":
      "CodeArena",

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

  if (
    text.includes("c")
  ) {
    return "C";
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

    case "Python":

      return `
import sys

def solve():

    input_data =
      sys.stdin.read().strip()

    # Write your code here

solve()
`;

    case "JavaScript":

      return `
function solve(input) {

    // Write your code here

}

const fs =
  require("fs");

const input =
  fs.readFileSync(
    0,
    "utf8"
  ).trim();

solve(input);
`;

    case "C":

      return `
#include <stdio.h>

int main() {

    // Write your code here

    return 0;
}
`;

    case "C++":

      return `
#include <bits/stdc++.h>
using namespace std;

int main() {

    // Write your code here

    return 0;
}
`;

    case "Java":

      return `
import java.util.*;

public class Main {

    public static void main(String[] args) {

        // Write your code here

    }

}
`;

    default:

      return `
import sys

def solve():

    input_data =
      sys.stdin.read().strip()

    # Write your code here

solve()
`;

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
// VALIDATE QUESTIONS
// ========================================

const validateQuestions = (
  questions = [],
  type
) => {

  if (!Array.isArray(questions)) {
    return [];
  }

  if (type === "CODING") {

    const hasRunnableCode = (q) => {

      const code =
        q.solutionCode || "";
    
      return (
    
        code.includes("main") ||
    
        code.includes("def solve") ||
    
        code.includes("process.stdin") ||
    
        code.includes("require(\"fs\")") ||
    
        code.includes("System.out") ||
    
        code.includes("#include")
    
      );
    
    };

    return questions.filter(

      (q) =>

        q.question &&
        q.starterCode &&
        q.solutionCode &&
        q.language &&

        hasRunnableCode(q) &&

        Array.isArray(
          q.visibleTestCases
        ) &&

        q.visibleTestCases.length > 0 &&

        Array.isArray(
          q.hiddenTestCases
        ) &&

        q.hiddenTestCases.length > 0

    );

  }

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
  count: finalCount,
  language,
  starterCode,
  aiPrompt,
}) => {

  let solutionExample = "";

  if (language === "Python") {

    solutionExample = `
import sys

def solve():

    s = sys.stdin.readline().strip()

    print(len(s))

solve()
`;

  }

  else if (
    language === "JavaScript"
  ) {

    solutionExample = `
const fs = require("fs");

const input =
  fs.readFileSync(
    0,
    "utf8"
  ).trim();

console.log(
  input.length
);
`;

  }

  else {

    solutionExample = `
#include <stdio.h>

int main() {

    int a,b;

    scanf("%d %d",&a,&b);

    printf("%d",a+b);

    return 0;
}
`;

  }

  if (type === "CODING") {

    return `
${aiPrompt || ""}

Generate ${finalCount} unique ${difficulty} coding interview questions for ${domain}.

STRICT RULES:

- Return ONLY valid JSON array
- No markdown
- No explanations
- Questions must be unique
- Use ${language}
- Problems MUST be Judge0 compatible
- solutionCode MUST contain complete runnable program
- solutionCode MUST compile independently
- starterCode MUST use stdin/stdout
- expectedOutput MUST exactly match actual output
- Keep questions SHORT
- Keep solutionCode concise
- NEVER print prompts like "Enter input"
- NEVER print labels like "Answer:"
- Output must contain ONLY the final answer
- Use competitive programming style input/output
- Keep starterCode minimal
- Avoid long explanations
- Avoid linked list/tree/graph struct problems
- Prefer stdin/stdout algorithm problems
- Python solutions MUST include import sys if using sys.stdin

Each coding question MUST contain:

1. question
2. starterCode
3. solutionCode
4. language
5. visibleTestCases
6. hiddenTestCases

VALID FORMAT:

[
  {
    "question":
      "Find length of string",

    "starterCode":
      "${starterCode
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"')}",

    "solutionCode":
      "${solutionExample
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"')}",

    "language":
      "${language}",

    "visibleTestCases": [
      {
        "input":
          "hello",

        "expectedOutput":
          "5"
      }
    ],

    "hiddenTestCases": [
      {
        "input":
          "python",

        "expectedOutput":
          "6"
      }
    ]
  }
]
`;

  }

  return `
${aiPrompt || ""}

Generate ${finalCount} unique ${difficulty} MCQ interview questions for ${domain}.

STRICT RULES:

- Return ONLY valid JSON array
- No markdown
- No explanations
- Ensure only ONE correct answer exists

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
  retries = 3
) => {

  const MODELS = [

    "deepseek/deepseek-chat:free",

    "openai/gpt-oss-20b:free",

    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"

  ];

  for (const model of MODELS) {

    try {

      const response =
        await openrouter.post(
          "/chat/completions",
          {

            model,

            messages: [

              {
                role: "system",

                content:
`
You are a JSON API.

Return ONLY valid JSON.

DO NOT:
- explain
- think
- reason
- add markdown
- add comments
- add text before JSON
- add text after JSON

IMPORTANT:
- Output must start with [
- Output must end with ]
- No trailing commas
- No code fences
`
              },

              {
                role: "user",
                content: prompt,
              },

            ],

            temperature: 0,

            top_p: 0.1,

            max_tokens: 4000,

          }
        );

      let raw =
        response.data?.choices?.[0]
          ?.message?.content || "[]";

      console.log(
        `SUCCESS MODEL: ${model}`
      );

      raw = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const start =
        raw.indexOf("[");

      const end =
        raw.lastIndexOf("]");

      if (
        start === -1 ||
        end === -1
      ) {

        throw new Error(
          "No valid JSON array found"
        );

      }

      raw =
        raw.substring(
          start,
          end + 1
        );

      raw = raw.replace(
        /,\s*}/g,
        "}"
      );

      raw = raw.replace(
        /,\s*]/g,
        "]"
      );

      const parsed =
        JSON.parse(raw);

      return validateQuestions(
        parsed,
        type
      );

    } catch (err) {

      console.log(
        `MODEL FAILED: ${model}`
      );

      console.log(
        err.response?.data ||
        err.message
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
    count = 1,
    aiPrompt = "",
  }) => {

    try {

      const language =
        detectLanguage(domain);

      const starterCode =
        getStarterCode(language);

        const finalCount = count;

      const prompt =
        createPrompt({

          domain,
          difficulty,
          type,
          count: finalCount,
          language,
          starterCode,
          aiPrompt,

        });

      const questions =
        await generateBatch({

          prompt,
          type,

        });

      const verifiedQuestions = [];

      if (type === "CODING") {

        for (const q of questions) {

          const verification =
            await verifyQuestion(q);

          if (verification.valid) {

            verifiedQuestions.push(q);

          } else {

            console.log(
              "Rejected Question:"
            );

            console.log(
              verification
            );

          }

        }

      } else {

        verifiedQuestions.push(
          ...questions
        );

      }

      const uniqueQuestions =
        removeDuplicateQuestions(
          verifiedQuestions
        );

        if (!questions.length) {

          return [
            {
              question:
                "Fallback Question",
              options: [
                "A",
                "B",
                "C",
                "D"
              ],
              answer: "A"
            }
          ];
        
        }
      return uniqueQuestions.slice(
        0,
        finalCount
      );

    } catch (error) {

      const errorData =
  error.response?.data;

console.log(
  errorData || error.message
);

if (
  errorData?.error?.code === 429
) {

  const retryText =
    errorData.error.message;

  const match =
    retryText.match(
      /retry in ([\d.]+)s/i
    );

  const waitSeconds =
    match
      ? parseFloat(match[1])
      : 40;

  console.log(
    `Waiting ${waitSeconds}s due to quota...`
  );

  await new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        waitSeconds * 1000
      )
  );

}

      throw new Error(
        "Question generation failed"
      );

    }

  };