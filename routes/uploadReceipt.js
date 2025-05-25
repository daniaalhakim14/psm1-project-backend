const express = require('express');
const multer = require('multer');
const path = require('path');
const { parsePdfReceipt } = require('../controllers/receiptController'); // ✅ correct export

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `receipt_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('receipt'), parsePdfReceipt); // ✅ use it directly

module.exports = router;
