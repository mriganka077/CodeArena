import axios from "axios";

export const generateQuestionsFromClaude = async ({
  domain,
  difficulty,
  type,
  count,
}) => {

  let prompt = "";

  if (type === "CODING") {

    prompt = `
Generate ${count} unique ${difficulty} level coding interview questions for ${domain}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- Questions must be coding/programming based
- Include starterCode
- Use Python language

Format:
[
  {
    "question": "Write a function to reverse a string.",
    "starterCode": "# Write your Python solution here",
    "language": "python"
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
    "question": "What is Python?",
    "options": [
      "Programming Language",
      "Database",
      "Browser",
      "Operating System"
    ],
    "answer": "Programming Language"
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
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
};