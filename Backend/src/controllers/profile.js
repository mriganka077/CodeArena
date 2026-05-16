import User from "../models/User.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
// In analyzeResume, replace the static import with:
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Groq from "groq-sdk";


// ── GET /api/profile ──────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "firstName lastName email phone location linkedin github bio skills profilePhoto resumeUrl resumeOriginalName education picture"
    );
    // console.log("education from DB:", JSON.stringify(user.education)); // ← add this
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── PUT /api/profile ──────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const allowed = ["firstName", "lastName", "phone", "location", "linkedin", "github", "bio", "skills"];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -emailVerifyToken -emailVerifyExpires -twoFactorSecret");

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/profile/photo ───────────────────────────────────────────────────
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const user = await User.findById(req.user._id);

    // Delete old photo only if it was a local upload (not a Google URL)
    if (user.picture && user.picture.startsWith("/uploads/")) {
      const oldPath = path.join("uploads", "photos", path.basename(user.picture));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photoUrl = `/uploads/photos/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { picture: photoUrl });

    res.status(200).json({ success: true, photoUrl });
  } catch (err) {
    console.error("uploadPhoto error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/profile/resume ──────────────────────────────────────────────────
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const user = await User.findById(req.user._id);

    // Delete old resume file
    if (user.resumeUrl) {
      const oldPath = path.join("uploads", "resumes", path.basename(user.resumeUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, {
      resumeUrl,
      resumeOriginalName: req.file.originalname,
    });

    res.status(200).json({
      success: true,
      resumeUrl,
      originalName: req.file.originalname,
      size: `${Math.round(req.file.size / 1024)} KB`,
    });
  } catch (err) {
    console.error("uploadResume error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── DELETE /api/profile/resume ────────────────────────────────────────────────
export const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.resumeUrl) {
      const oldPath = path.join("uploads", "resumes", path.basename(user.resumeUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await User.findByIdAndUpdate(req.user._id, { resumeUrl: "", resumeOriginalName: "" });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── PUT /api/profile/education ────────────────────────────────────────────────
// Replaces the full education array (client sends the full list)
export const updateEducation = async (req, res) => {
  try {
    const { education } = req.body;
    if (!Array.isArray(education))
      return res.status(400).json({ success: false, message: "education must be an array" });

    // Generate _id for any entry that is missing one
    const educationWithIds = education.map(edu => ({
      ...edu,
      _id: edu._id && edu._id !== "null" ? edu._id : new mongoose.Types.ObjectId(),
      docs: (edu.docs || []).map(doc => ({
        ...doc,
        _id: doc._id && doc._id !== "null" ? doc._id : new mongoose.Types.ObjectId(),
      })),
    }));

    const user = await User.findById(req.user._id);
    user.education = educationWithIds;
    await user.save();

    res.status(200).json({ success: true, education: user.education });
  } catch (err) {
    console.error("updateEducation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/profile/education/:eduId/doc ────────────────────────────────────
export const uploadEduDoc = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const { eduId } = req.params;
    const user = await User.findById(req.user._id);

    const edu = user.education.id(eduId);
    if (!edu) return res.status(404).json({ success: false, message: "Education entry not found" });

    edu.docs.push({
      name: req.file.originalname,
      path: `/uploads/edu-docs/${req.file.filename}`,
      size: `${Math.round(req.file.size / 1024)} KB`,
    });

    await user.save();

    const newDoc = edu.docs[edu.docs.length - 1];
    res.status(200).json({ success: true, doc: newDoc });
  } catch (err) {
    console.error("uploadEduDoc error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── DELETE /api/profile/education/:eduId/doc/:docId ───────────────────────────
export const deleteEduDoc = async (req, res) => {
  try {
    const { eduId, docId } = req.params;
    const user = await User.findById(req.user._id);

    const edu = user.education.id(eduId);
    if (!edu) return res.status(404).json({ success: false, message: "Education entry not found" });

    const doc = edu.docs.id(docId);
    if (doc) {
      const filePath = path.join("uploads", "edu-docs", path.basename(doc.path));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      doc.deleteOne();
    }

    await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("deleteEduDoc error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ── POST /api/profile/resume/analyze ─────────────────────────────────────────
const ANALYSIS_PROMPT = (text) => `
You are an expert technical recruiter and career coach reviewing a candidate's resume.
Analyze the resume below and return ONLY a valid JSON object. No markdown, no backticks, no explanation.

JSON structure (follow exactly):
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    { "issue": "<short title>", "detail": "<actionable suggestion>" }
  ],
  "atsScore": <number 0-100>,
  "atsTips": ["<tip 1>", "<tip 2>"],
  "missingKeywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "sections": {
    "contact": <number 0-100>,
    "summary": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>,
    "projects": <number 0-100>
  }
}

Resume:
---
${text.slice(0, 6000)}
---
`;

async function analyzeWithGroq(resumeText) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: ANALYSIS_PROMPT(resumeText) }],
    temperature: 0.3,
    max_tokens: 1200,
  });
  return completion.choices[0].message.content;
}

async function analyzeWithOpenRouter(resumeText) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [{ role: "user", content: ANALYSIS_PROMPT(resumeText) }],
      temperature: 0.3,
      max_tokens: 1200,
    }),
  });
  const json = await res.json();
  if (!json.choices?.[0]) throw new Error("OpenRouter returned no choices");
  return json.choices[0].message.content;
}

export const analyzeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.resumeUrl)
      return res.status(400).json({ success: false, message: "No resume uploaded yet" });

    const resumePath = path.join(process.cwd(), user.resumeUrl);
    if (!fs.existsSync(resumePath))
      return res.status(404).json({ success: false, message: "Resume file not found on disk" });

    // Only PDF supported for text extraction
    const ext = path.extname(resumePath).toLowerCase();
    if (ext !== ".pdf")
      return res.status(422).json({ success: false, message: "Only PDF resumes can be analyzed. Please upload a PDF." });

    const dataBuffer = fs.readFileSync(resumePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text?.trim();

    if (!resumeText || resumeText.length < 50)
      return res.status(422).json({ success: false, message: "Could not extract text from your resume. Make sure it's not a scanned/image PDF." });

    // Try Groq first, fall back to OpenRouter
    let rawResponse;
    try {
      rawResponse = await analyzeWithGroq(resumeText);
    } catch (groqErr) {
      console.warn("Groq failed, trying OpenRouter:", groqErr.message);
      if (!process.env.OPENROUTER_API_KEY)
        throw new Error("AI analysis unavailable — Groq rate limit hit and no fallback configured.");
      rawResponse = await analyzeWithOpenRouter(resumeText);
    }

    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleaned);

    res.status(200).json({ success: true, analysis });
  } catch (err) {
    console.error("analyzeResume error:", err);
    res.status(500).json({ success: false, message: err.message || "Analysis failed" });
  }
};