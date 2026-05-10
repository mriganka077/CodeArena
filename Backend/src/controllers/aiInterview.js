import { askAI } from "../api/openrouter.js";

export const startAIInterview =
  async (req, res) => {

    try {

      const {
        role,
        difficulty,
        techStack,
      } = req.body;

      const prompt = `
You are a professional AI technical interviewer.

Generate ONE realistic interview question.

Role:
${role}

Difficulty:
${difficulty}

Tech Stack:
${techStack}

Rules:
- Ask only one question
- Technical interview style
- No explanation
`;

      const question = await askAI({
        prompt,
      });

      res.json({
        success: true,
        question,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

export const evaluateAIAnswer =
  async (req, res) => {

    try {

      const {
        question,
        answer,
        role,
      } = req.body;

      const prompt = `
You are an expert AI interviewer.

Question:
${question}

Candidate Answer:
${answer}

Role:
${role}

Evaluate the answer carefully.

Return ONLY valid JSON:

{
  "score": 0-10,
  "feedback": "",
  "strengths": [],
  "weaknesses": [],
  "followUpQuestion": ""
}
`;

      const result = await askAI({
        prompt,
      });

      res.json({
        success: true,
        result: JSON.parse(result),
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};