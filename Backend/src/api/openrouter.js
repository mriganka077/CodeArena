import axios from "axios";

const detectLanguage = (domain = "") => {

  const text = domain.toLowerCase();

  if (
    text.includes("javascript") ||
    text.includes("js") ||
    text.includes("react") ||
    text.includes("node")
  ) {
    return "JavaScript";
  }

  if (
    text.includes("typescript") ||
    text.includes("ts")
  ) {
    return "TypeScript";
  }

  if (text.includes("python")) {
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

  return "Python";
};

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
// QUESTION GENERATION
// ============================

export const generateQuestionsFromClaude =
async ({
  domain,
  difficulty,
  type,
  count,
}) => {

  const language =
    detectLanguage(domain);

  const starterCode =
    getStarterCode(language);

  let prompt = "";

  if (type === "CODING") {

    prompt = `
Generate ${count} unique ${difficulty} level coding interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- Generate coding questions in ${language}
- Include starterCode
- Include language field

Format:
[
  {
    "question": "",
    "starterCode": "${starterCode}",
    "language": "${language}"
  }
]
`;

  } else {

    prompt = `
Generate ${count} unique ${difficulty} level MCQ interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- Each question must have exactly 4 options

Format:
[
  {
    "question": "",
    "options": [],
    "answer": ""
  }
]
`;
  }

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization:
          `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type":
          "application/json",
      },
    }
  );

  return response.data
    .choices[0]
    .message.content;
};



// ============================
// GENERAL AI HELPER
// ============================

export const askAI = async ({
  prompt,
  temperature = 0.7,
}) => {

  try {

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature,
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json",
        },
      }
    );

    return (
      response.data?.choices?.[0]
        ?.message?.content || ""
    );

  } catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    throw new Error(
      "OpenRouter request failed"
    );
  }
};