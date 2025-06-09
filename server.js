//server.js
require('dotenv').config(); // Load env vars first
// using Express
const express = require('express');
const pg = require('pg');   // PostgreSQL client
const cors = require('cors'); // Enables Cross-Origin requests

// Initialize the Express application
const app = express();

// Define the port
const port = process.env.PORT;

// Allows requests from any origin (frontend)
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Import routes handlers
const categoryRouter = require('./routes/category');
const uploadReceiptRouter = require('./routes/uploadReceipt');
const expenseRouter = require('./routes/expense');
const userRouter = require('./routes/user');
const itemPriceRouter = require('./routes/itemPrice');



// parse json
// Increase payload size limit to 10mb
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// register the routes
app.use('/category',categoryRouter);
app.use('/upload-receipt', uploadReceiptRouter);
app.use('/expense', expenseRouter);
app.use('/user', userRouter);
app.use('/itemPrice', itemPriceRouter);


// Defalut route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// start up server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });


