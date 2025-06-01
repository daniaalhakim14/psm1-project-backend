const express = require('express');
const userRouter = express.Router();
const { signUp, login, fetchUserDetails } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware'); 

// Make sure route path starts with a slash!
userRouter.post('/signUp', signUp);
userRouter.post('/login', login);

userRouter.get('/email/:email', authenticateToken, fetchUserDetails);


module.exports = userRouter;
