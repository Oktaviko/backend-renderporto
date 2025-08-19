const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch"); // Tambahkan ini jika belum

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("API key Gemini tidak ditemukan.");
}

// Force SDK ke versi v1
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY, {
  apiEndpoint: "https://generativelanguage.googleapis.com/v1", // 🔥 Penting!
  fetch, // Pakai fetch agar jalan di Node
});

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" }); // model yang tersedia

router.post("/send", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();
    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Terjadi kesalahan pada server Gemini." });
  }
});

module.exports = router;
