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