import MockInterview from "../models/MockInterview.js";

export const createSession = async (req, res) => {
  try {
    const { domain, category, startedAt } = req.body; // ← removed difficulty
    const userId = req.user?._id || null;

    const session = await MockInterview.create({
      userId,
      domain,
      category,
      startedAt: startedAt || new Date(),
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error("MockInterview create error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const userId = req.user?._id;
    const query = userId ? { userId } : {};
    const sessions = await MockInterview.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitMockInterviewResult =
async (req, res) => {

  try {

    const {
      sessionId,
      timeTaken,
      status,
      violations,
      terminationReason,
      transcript,
    } = req.body;

    // =========================
    // CLEAN TRANSCRIPT
    // =========================

    const cleanedTranscript = [];

    for (const item of transcript || []) {

      if (
        !item.text ||
        !item.text.trim()
      ) continue;

      const text = item.text
        .replace(/\s+/g, " ")
        .trim();

      const last =
        cleanedTranscript[
          cleanedTranscript.length - 1
        ];

      if (!last) {

        cleanedTranscript.push({
          role: item.role,
          text,
          timestamp:
            item.timestamp,
        });

        continue;
      }

      if (last.role === item.role) {

        if (last.text === text) {
          continue;
        }

        if (
          text.startsWith(
            last.text
          )
        ) {

          last.text = text;

          last.timestamp =
            item.timestamp;

          continue;
        }

        if (
          last.text.startsWith(
            text
          )
        ) {
          continue;
        }
      }

      cleanedTranscript.push({
        role: item.role,
        text,
        timestamp:
          item.timestamp,
      });
    }

    // =========================
    // USER RESPONSES
    // =========================

    const userMessages =
      cleanedTranscript.filter(
        (m) =>
          m.role === "user" &&
          m.text.trim().length > 3
      );

    let parsed = null;

    // =========================
    // NO RESPONSE
    // =========================

    if (userMessages.length === 0) {

      parsed = {

        score: 0,

        recommendation:
          "No Hire",

        feedback:
          "Candidate did not provide meaningful responses.",

        technicalKnowledge: 0,

        communication: 0,

        problemSolving: 0,

        confidence: 0,
      };
    }

    // =========================
    // AI ANALYSIS
    // =========================

    if (!parsed) {

      const transcriptText =
        cleanedTranscript
          .map(
            (m) =>
              `${m.role.toUpperCase()}: ${m.text}`
          )
          .join("\n");

      const prompt = `
You are an expert AI interviewer.

Analyze this mock interview transcript.

Be strict and realistic.

Evaluate:

- technicalKnowledge
- communication
- problemSolving
- confidence

Return ONLY valid JSON.

Transcript:
${transcriptText}

JSON format:

{
  "score": number,
  "recommendation": "Strong Hire" | "Hire" | "No Hire",
  "feedback": "short feedback",
  "technicalKnowledge": number,
  "communication": number,
  "problemSolving": number,
  "confidence": number
}
`;

      const completion =
        await client.chat.completions.create({

          model:
            "meta/llama-3.1-8b-instruct",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.2,

          top_p: 0.7,

          max_tokens: 500,
        });

      let aiResponse =
        completion.choices[0]
          .message.content;

      aiResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {

        parsed =
          JSON.parse(aiResponse);

      } catch {

        parsed = {

          score: 50,

          recommendation:
            "No Hire",

          feedback:
            "AI evaluation failed.",

          technicalKnowledge: 50,

          communication: 50,

          problemSolving: 50,

          confidence: 50,
        };
      }
    }

    // =========================
    // UPDATE SESSION
    // =========================

    const updatedSession =
      await MockInterview.findByIdAndUpdate(

        sessionId,

        {

          timeTaken,

          status,

          violations,

          terminationReason,

          transcript:
            cleanedTranscript,

          score:
            parsed.score,

          feedback:
            parsed.feedback,

          recommendation:
            parsed.recommendation,

          technicalKnowledge:
            parsed.technicalKnowledge,

          communication:
            parsed.communication,

          problemSolving:
            parsed.problemSolving,

          confidence:
            parsed.confidence,
        },

        {
          new: true,
        }
      );

    res.status(200).json({

      success: true,

      result:
        updatedSession,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Failed to submit mock interview result",
    });
  }
};