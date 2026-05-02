module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { text, lang } = req.body;
    const apiKey = (process.env.GEMINI_API_KEY || process.env["GEMINI_API_KEY "] || "").trim();

    if (!apiKey) return res.status(500).json({ error: "API Key missing in Vercel settings" });

    const prompt = `Analyze this job description for scams in Pakistan. Answer in 3 short points. Language: ${lang === 'en' ? 'English' : 'Roman Urdu'}. Text: "${text}"`;

    // Try multiple combinations of version and model
    const attempts = [
      { ver: 'v1beta', mod: 'gemini-1.5-flash' },
      { ver: 'v1', mod: 'gemini-pro' },
      { ver: 'v1beta', mod: 'gemini-pro' }
    ];

    let lastError = "";

    for (const attempt of attempts) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/${attempt.ver}/models/${attempt.mod}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
          return res.status(200).json({ analysis: data.candidates[0].content.parts[0].text });
        }
        lastError = data.error ? data.error.message : JSON.stringify(data);
      } catch (e) {
        lastError = e.message;
      }
    }

    throw new Error(lastError || "All models failed");

  } catch (error) {
    return res.status(500).json({ error: "AI Error", details: error.message });
  }
};
