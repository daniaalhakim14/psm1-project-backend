// to fecth all the expense categories 
const express = require('express');
const categoryRouter = express.Router();

// database connection
const db = require('./../db');

categoryRouter.get('/', (req, res) => {
    const query  = 'SELECT * FROM expensecategory';

    db.query(query, (error, results) => {
        if (error) {
            console.error('Database error:', error); // 👈 Logs the error in the terminal
            return res.status(500).send({ error: 'Database error', details: error.message });
        }
        else if (results.rows.length == 0) {
            res.status(404).send({message: 'no category found'});
        }
        else {
            res.status(200).json(results.rows);
        }
    });
});

module.exports = categoryRouter;
