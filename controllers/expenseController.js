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

exports.getExpenses = async (req, res) => {
    const userId = req.user.userid; // from JWT

    const query = `
        SELECT e.*, ec.name AS category_name, ec.description AS category_description
        FROM expense e
        JOIN expensecategory ec ON e.categoryId = ec.id
        WHERE e.userId = $1
        ORDER BY e.date DESC;
    `;

    try {
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};
