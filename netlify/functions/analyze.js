const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { text, lang } = JSON.parse(event.body);
    
    // Get API Key from Environment Variable (Hiding it from users)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "API Key not configured on server" }) 
      };
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

    return {
      statusCode: 200,
      body: JSON.stringify({ analysis: aiText }),
    };
  } catch (error) {
    console.error("Error in AI Analysis:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to analyze text" }),
    };
  }
};
