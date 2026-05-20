import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ============================
// NVIDIA CLIENT
// ============================

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

// ============================
// LANGUAGE DETECTION
// ============================

const detectLanguage = (domain = "") => {
  const text = domain.toLowerCase();

  // TypeScript FIRST
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
    text.includes("golang") ||
    text.includes("go developer")
  ) {
    return "Go";
  }

  if (
    text.includes("backend") ||
    text.includes("full stack") ||
    text.includes("software engineer")
  ) {
    return "JavaScript";
  }

  return "Python";
};

// ============================
// STARTER CODE
// ============================

const getStarterCode = (language) => {
  switch (language) {
    case "Java":
      return `class Solution {
    public static void main(String[] args) {

    }
}`;

    case "JavaScript":
      return `function solution() {

}`;

    case "TypeScript":
      return `function solution(): void {

}`;

    case "C++":
      return `#include <iostream>
using namespace std;

int main() {

    return 0;
}`;

    case "C#":
      return `using System;

class Solution
{
    static void Main()
    {

    }
}`;

    case "PHP":
      return `<?php

function solution() {

}

?>`;

    case "Go":
      return `package main

import "fmt"

func main() {

}`;

    default:
      return `# Write your Python solution here`;
  }
};

// ============================
// REMOVE DUPLICATES
// ============================

const removeDuplicateQuestions = (
  questions = []
) => {
  return questions.filter(
    (question, index, self) => {
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

// ============================
// CLEAN RAW RESPONSE
// ============================

const cleanJsonResponse = (
  raw = ""
) => {
  raw = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // remove trailing commas
  raw = raw.replace(/,\s*}/g, "}");
  raw = raw.replace(/,\s*]/g, "]");

  return raw;
};

// ============================
// VALIDATE QUESTIONS
// ============================

const validateQuestions = (
  questions = [],
  type
) => {
  if (!Array.isArray(questions)) {
    return [];
  }

  if (type === "CODING") {
    return questions.filter(
      (q) =>
        q.question &&
        q.starterCode &&
        q.language
    );
  }

  return questions.filter(
    (q) =>
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.answer
  );
};

// ============================
// CREATE PROMPT
// ============================

const createPrompt = ({
  domain,
  difficulty,
  type,
  count,
  language,
  starterCode,
  aiPrompt,
}) => {
  if (type === "CODING") {
    return `
${aiPrompt || ""}

Generate ${count} unique ${difficulty} coding interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Questions must be different
- Use ${language}
- Escape newlines properly

Format:
[
  {
    "question": "",
    "starterCode": "${starterCode
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/"/g, '\\"')}",
    "language": "${language}"
  }
]
`;
  }

  return `
${aiPrompt || ""}

Generate ${count} unique ${difficulty} MCQ interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Every question must have exactly 4 options

Format:
[
  {
    "question": "",
    "options": [],
    "answer": ""
  }
]
`;
};

// ============================
// CALL AI
// ============================

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

      raw = cleanJsonResponse(raw);

      // Fix malformed starterCode
      raw = raw.replace(
        /"starterCode"\s*:\s*"([\s\S]*?)"/g,
        (match, code) => {
          const escaped =
            JSON.stringify(code).slice(
              1,
              -1
            );

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

      if (validated.length > 0) {
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

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          1000 * (attempt + 1)
        )
      );
    }
  }

  return [];
};

// ============================
// GENERATE QUESTIONS
// ============================

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
        Math.ceil(count / batchSize);

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
        await Promise.all(requests);

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