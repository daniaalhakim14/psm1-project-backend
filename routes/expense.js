const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // for parsing multipart/form-data
const expenseController = require('../controllers/expenseController');
const authenticateToken = require('../middleware/authMiddleware'); // 🆕

// POST route with file upload
router.post('/', authenticateToken, upload.single('receipt'), expenseController.addExpense);
router.get('/:id', authenticateToken, expenseController.getExpenses);

module.exports = router;
