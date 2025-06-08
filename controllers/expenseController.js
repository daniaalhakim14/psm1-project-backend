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
        Select
            e.*,
            c.categoryname as categoryname,
            c.iconcodepoint,
            c.iconfontfamily,
            c.iconcolor
        FROM 
            expense e
        JOIN
            expensecategory c
        ON
            e.categoryid = c.categoryid
        WHERE
            e.userid = $1
    `;

    try {
        const result = await db.query(query, [userId]);
        // console.log('Fetched expenses for user:', userId);
        // console.log('Expenses result:', JSON.stringify(result.rows, null, 2)); // Pretty print
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

exports.getListExpenses = async (req, res) => {
    const userId = req.user.userid; // from JWT

    const query = `
        SELECT
        e.expenseid,
        e.amount,   
        e.date,
        e.description,
        e.userid,
        e.platformid,
        e.categoryid,
        c.categoryname,
        c.iconcodepoint,
        c.iconfontfamily,
        c.iconcolor

        FROM expense e
        JOIN expensecategory c ON e.categoryid = c.categoryid,
        WHERE e.userid = $1
        ORDER BY e.date DESC;
        `;

        db.query(query,[userid],(error, results) =>{
        if(error){
            console.error('Database error:', error);
            return res.status(500).send({error:'Database error'});
        }
        if (results.rows.length > 0) {
            res.status(200).json(results.rows); // Send the transaction data as JSON
        } else {
            res.status(404).send({ error: 'No transactions found' });
        }
    })
};
