const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { text, lang } = req.body;
    
    // Get API Key from Environment Variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured on server" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a job scam detector expert in Pakistan. Analyze the following job description and explain why it is likely a scam or if it looks legitimate. 
    Focus on specific indicators like suspicious payment methods (Easypaisa/JazzCash), unprofessional contact, unrealistic salary, or registration fees.
    Write your response in 3-4 concise points. 
    Language of response: ${lang === 'en' ? 'English' : 'Roman Urdu'}.
    
    Job Description: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    return res.status(200).json({ analysis: aiText });
  } catch (error) {
    console.error("Error in AI Analysis:", error);
    return res.status(500).json({ error: "Failed to analyze text" });
  }
};
