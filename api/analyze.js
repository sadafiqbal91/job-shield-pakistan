module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { text, lang } = req.body;
    
    // Safety check for API Key (Checking multiple variants just in case of spaces)
    const apiKey = process.env.GEMINI_API_KEY || process.env["GEMINI_API_KEY "] || process.env[" GEMINI_API_KEY"];

    if (!apiKey) {
      return res.status(500).json({ error: "API Key not found. Please check Vercel Environment Variables for spaces." });
    }

    const prompt = `You are a job scam detector expert in Pakistan. Analyze the following job description and explain why it is likely a scam or if it looks legitimate. 
    Focus on specific indicators like suspicious payment methods (Easypaisa/JazzCash), unprofessional contact, unrealistic salary, or registration fees.
    Write your response in 3-4 concise points. 
    Language of response: ${lang === 'en' ? 'English' : 'Roman Urdu'}.
    
    Job Description: "${text}"`;

    // Try Gemini 1.5 Flash first, then fallback to Gemini Pro
    const models = ["gemini-1.5-flash", "gemini-pro"];
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          const aiText = data.candidates[0].content.parts[0].text;
          return res.status(200).json({ analysis: aiText });
        } else {
          lastError = data.error ? data.error.message : JSON.stringify(data);
          continue; // Try next model
        }
      } catch (e) {
        lastError = e.message;
        continue;
      }
    }

    throw new Error(lastError || "All AI models failed");

  } catch (error) {
    console.error("Error in AI Analysis:", error);
    return res.status(500).json({ error: "Failed to analyze text", details: error.message });
  }
};
