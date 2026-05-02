module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { text, lang } = req.body;
    const rawKey = process.env.GEMINI_API_KEY || process.env["GEMINI_API_KEY "] || "";
    const apiKey = rawKey.trim();

    if (!apiKey) return res.status(500).json({ error: "Key not found in Vercel" });

    // Diagnostic: Key Preview
    const keyPreview = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;

    const prompt = `Analyze this job description for scams in Pakistan. Answer in 3 points. Language: ${lang === 'en' ? 'English' : 'Roman Urdu'}. Text: "${text}"`;

    // Try just one stable one first
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      return res.status(200).json({ analysis: data.candidates[0].content.parts[0].text });
    } else {
      // Return detailed diagnostic info
      return res.status(500).json({ 
        error: "Google Rejecting Request", 
        keyUsed: keyPreview,
        googleResponse: data 
      });
    }

  } catch (error) {
    return res.status(500).json({ error: "Server Error", details: error.message });
  }
};
