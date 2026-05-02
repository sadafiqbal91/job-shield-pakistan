module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { text, lang } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key is missing on Vercel" });
    }

    const prompt = `You are a job scam detector expert in Pakistan. Analyze the following job description and explain why it is likely a scam or if it looks legitimate. 
    Focus on specific indicators like suspicious payment methods (Easypaisa/JazzCash), unprofessional contact, unrealistic salary, or registration fees.
    Write your response in 3-4 concise points. 
    Language of response: ${lang === 'en' ? 'English' : 'Roman Urdu'}.
    
    Job Description: "${text}"`;

    // Using REST API directly via fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      const aiText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ analysis: aiText });
    } else {
      const errorMsg = data.error ? data.error.message : (data.promptFeedback ? "Blocked by safety filters" : JSON.stringify(data));
      throw new Error(`Google API: ${errorMsg}`);
    }

  } catch (error) {
    console.error("Error in AI Analysis:", error);
    return res.status(500).json({ 
      error: "Failed to analyze text", 
      details: error.message 
    });
  }
};
