// expenseController.js
const db = require('../db');

// Add new expense controller
exports.addExpense = async (req, res) => {
    const { amount, date, description, platformId, userId, categoryId, receipt } = req.body;

    if (!amount || !date || !description || !platformId || !userId || !categoryId || !receipt) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    //  Convert base64 to buffer AFTER receipt is defined
    const receiptBuffer = Buffer.from(receipt, 'base64');

    const query = `
        INSERT INTO expense (amount, date, description, platformId, receipt, userId, categoryId)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;

    try {
        const result = await db.query(query, [
            amount,
            date,
            description,
            platformId,
            receiptBuffer,
            userId,
            categoryId,
        ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting expense:', error.message);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};
