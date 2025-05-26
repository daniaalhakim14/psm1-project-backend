const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // for parsing multipart/form-data
const expenseController = require('../controllers/expenseController');

// POST route with file upload
router.post('/', upload.single('receipt'), expenseController.addExpense);

module.exports = router;
