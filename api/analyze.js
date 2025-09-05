// 这是一个 Vercel Serverless Function，用于代理对 Google Gemini API 的请求。
// 请将此文件保存在你的项目根目录下的 'api' 文件夹中。

// 导入必需的模块
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
    // 确保请求方法是 POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 从环境变量中获取 API 密钥，保障安全
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('API key is not configured in Vercel environment variables.');
        }

        // 从请求体中获取前端发送的数据
        const { userPrompt, inlineData } = req.body;

        // 初始化 Google Generative AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        // 构建请求体，包括文本和图片数据
        const parts = [
            { text: userPrompt },
            {
                inlineData: {
                    mimeType: inlineData.mimeType,
                    data: inlineData.data
                }
            }
        ];

        // 调用 Gemini API
        const result = await model.generateContent({ contents: [{ parts }] });
        const response = await result.response;

        // 将结果返回给前端
        res.status(200).json(response);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: { message: error.message || 'An unknown error occurred.' } });
    }
};
