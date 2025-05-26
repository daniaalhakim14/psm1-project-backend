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
    const fileBuffer = req.file.buffer;
    const filePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: 'application/pdf',
      },
    };

    const prompt = `
You are a smart receipt parser. From this receipt, extract the following information:
- Date of the receipt
- Total amount
- A list of items with each item's name, quantity (if available), and price
- Determine the most appropriate expense category for the receipt based on the items purchased

Use the following allowed categories and their description in brackets to classify the receipt:

Allowed categories:
- Food (Groceries, Restaurants, Snacks)
- Transportation (Travel, Fuel, Parking)
- Entertainment (Movies, Music, Games, Dining out)
- Housing (Rent, Utilities, Home Improvements)
- Shopping (Clothing, Electronics, Accessories)
- Healthcare (Medical Appointments, Prescriptions)
- Personal (Hobbies, Gifts, Donations)
- Education (Tuition Fees, Books)
- Savings (Savings for future goals)
- Other (Miscellaneous expenses)

Return the response in the following JSON format:
{
  "date": "...",
  "total": "...",
  "category": {
    "name": "...",
    "description": "..."
  },
  "items": [
    { "name": "...", "quantity": "...", "price": "..." }
  ]
}
`;

    let text = ""; // declare text in outer scope

    try {
      const result = await model.generateContent([prompt, filePart]);
      text = result.response.text();
      //console.log("Gemini Response:\n", text);
    } catch (genErr) {
      console.error("Error generating content:", genErr);
      return res.status(500).json({ error: "AI model failed", details: genErr.message });
    }

    try {
      const parsed = JSON.parse(text);
      res.json({ data: parsed });
    } catch (err) {
      res.status(200).json({ data: { rawText: text.trim() } }); // Still under `data`
    }

    // fs.unlinkSync(filePath); // Clean up file
  } catch (err) {
    console.error("Error processing receipt:", err.message);
    res.status(500).json({ error: "Failed to process PDF", details: err.message });
  }
};

module.exports = { parsePdfReceipt };
