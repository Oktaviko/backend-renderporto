const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ambil API key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiReply(userInput) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(userInput);
  const response = result.response;
  const text = response.text();

  return text;
}

module.exports = getGeminiReply;
