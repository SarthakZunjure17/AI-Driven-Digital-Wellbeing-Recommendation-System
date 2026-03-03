const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: "You are a digital wellbeing coach. Give 3 tips to reduce screen time."
    });

    console.log("Gemini Response:");
    console.log(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
  }
}

testGemini();