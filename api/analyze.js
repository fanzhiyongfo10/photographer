const { GoogleGenerativeAI } = require('@google/generative-ai');

// IMPORTANT: Never hard-code your API key in the file.
// Vercel will inject it as an environment variable (GEMINI_API_KEY).
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  // Set CORS headers to allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!req.body || !req.body.text) {
    return res.status(400).json({ error: 'Request body must contain a "text" field.' });
  }

  // Use the correct model for text generation: gemini-1.5-flash
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = req.body.text;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        text: text,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred.',
      details: error.toString(),
    });
  }
};
