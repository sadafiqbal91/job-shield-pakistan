module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { text, lang } = req.body;
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) return res.status(500).json({ error: "Configuration Error" });

    const prompt = `Analyze this job description for scams in Pakistan. Answer in 3 clear points. Language: ${lang === 'en' ? 'English' : 'Roman Urdu'}. Text: "${text}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      return res.status(200).json({ analysis: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: "AI Analysis failed", details: "Please try again later." });
    }

  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};
