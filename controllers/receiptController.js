require('dotenv').config(); // Load .env
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const parsePdfReceipt = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const fileBuffer = fs.readFileSync(filePath);
    const filePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: 'application/pdf',
      },
    };

    const prompt = `
You are a receipt parser. From this receipt, extract the following information:
- Date
- Total Amount
- List of items: each with name, quantity (if any), and price.

Format the result as JSON:
{
  "date": "...",
  "total": "...",
  "items": [
    { "name": "...", "quantity": "...", "price": "..." }
  ]
}
`;

    const result = await model.generateContent([prompt, filePart]);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      res.json({ data: parsed });
    } catch (err) {
      res.json({ raw: text.trim() });
    }

    fs.unlinkSync(filePath); // Clean up file
  } catch (err) {
    console.error("Error processing receipt:", err.message);
    res.status(500).json({ error: "Failed to process PDF", details: err.message });
  }
};

module.exports = { parsePdfReceipt };
