module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { text, lang } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env["GEMINI_API_KEY "] || process.env[" GEMINI_API_KEY"];

    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing in Vercel settings" });
    }

    const prompt = `Analyze this job description for scams in Pakistan. Answer in 3 points. Language: ${lang === 'en' ? 'English' : 'Roman Urdu'}. Text: "${text}"`;

    // Standard v1 endpoint with gemini-1.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({ analysis: data.candidates[0].content.parts[0].text });
    } else {
      const errorMsg = data.error ? data.error.message : JSON.stringify(data);
      throw new Error(errorMsg);
    }

  } catch (error) {
    return res.status(500).json({ error: "AI Error", details: error.message });
  }
};
