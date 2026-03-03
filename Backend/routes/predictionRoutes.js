const express = require("express");
const router = express.Router();
const axios = require("axios");
const Prediction = require("../models/Prediction");
const { GoogleGenAI } = require("@google/genai");

require("dotenv").config();

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// POST /api/predict
router.post("/", async (req, res) => {
  try {
    // ===============================
    // 1️⃣ Call ML Service (FastAPI)
    // ===============================
    const mlResponse = await axios.post(
      "http://127.0.0.1:8000/predict",
      req.body
    );

    const mlData = mlResponse.data;

    const predictedClass = mlData.predicted_class;
    const riskScore = mlData.risk_score;

    // ===============================
    // 2️⃣ Generate AI Plan (Gemini)
    // ===============================
    const aiResponse = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: `
You are an AI Digital Wellbeing Coach.

User Data:
- Predicted Addiction Level: ${predictedClass}
- Risk Score: ${riskScore}
- Daily Screen Time: ${req.body.daily_screen_time_hours}
- Social Media Hours: ${req.body.social_media_hours}
- Gaming Hours: ${req.body.gaming_hours}
- Sleep Hours: ${req.body.sleep_hours}
- Stress Level: ${req.body.stress_level_encoded}

Generate a structured JSON response in EXACTLY this format:

{
  "risk_summary": "",
  "primary_risk_factors": [],
  "weekly_plan": {
    "monday": "",
    "tuesday": "",
    "wednesday": "",
    "thursday": "",
    "friday": "",
    "saturday": "",
    "sunday": ""
  },
  "daily_limit_recommendation": "",
  "behavioral_goals": [],
  "motivational_message": ""
}

Return ONLY valid JSON.
Do NOT add explanation.
Do NOT add markdown.
`
    });

    let aiPlan;

    try {
      aiPlan = JSON.parse(aiResponse.text);
    } catch (err) {
      console.error("AI JSON parse error:", err);
      aiPlan = {
        error: "AI response formatting issue",
        raw_response: aiResponse.text
      };
    }

    // ===============================
    // 3️⃣ Save Everything to MongoDB
    // ===============================
    const newPrediction = new Prediction({
      predictedClass: predictedClass,
      riskScore: riskScore,
      probabilities: mlData.probabilities,
      aiPlan: aiPlan,
      inputData: req.body,
      createdAt: new Date()
    });

    await newPrediction.save();

    // ===============================
    // 4️⃣ Return Full Intelligent Response
    // ===============================
    res.json({
      predicted_class: predictedClass,
      risk_score: riskScore,
      probabilities: mlData.probabilities,
      ai_plan: aiPlan
    });

  } catch (error) {
    console.error("Prediction route error:", error);
    res.status(500).json({ error: "Prediction failed" });
  }
});

module.exports = router;