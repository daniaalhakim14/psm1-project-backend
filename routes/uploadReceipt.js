const express = require('express');
const multer = require('multer');
const path = require('path');
const { parsePdfReceipt } = require('../controllers/receiptController'); // ✅ correct export
const authenticateToken = require('../middleware/authMiddleware'); // 🆕

const router = express.Router();
// pdf storage in memory not on disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/',authenticateToken, upload.single('receipt'),parsePdfReceipt);


module.exports = router;
