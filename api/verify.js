module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { text, lang } = req.body;
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) return res.status(500).json({ error: "Key not found" });

    // 1. Try to list models first to see what this key can actually do
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    const prompt = `Analyze this job description for scams in Pakistan. Answer in 3 points. Language: ${lang === 'en' ? 'English' : 'Roman Urdu'}. Text: "${text}"`;

    // 2. Try the analysis
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      return res.status(200).json({ analysis: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ 
        error: "Google Rejecting", 
        availableModels: listData.models ? listData.models.map(m => m.name) : "No models found",
        details: data.error ? data.error.message : JSON.stringify(data) 
      });
    }

  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};
