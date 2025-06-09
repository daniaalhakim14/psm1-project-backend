const express = require('express');
const router = express.Router();
const itemPriceController = require('../controllers/itemPriceController');

router.get('/itemSearch',itemPriceController.getItemSearch);
module.exports = router;