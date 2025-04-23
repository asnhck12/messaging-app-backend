var express = require('express');
var router = express.Router();
const {verifyToken} = require('../middleware/jwtMiddleware');

var userRouter = require('./users');
var messageRouter = require('./messages');
var conversationRouter = require('./conversations')

// Attach all routes
router.use("/users", userRouter);
router.use("/messages", verifyToken, messageRouter);
router.use("/conversations", verifyToken, conversationRouter)

module.exports = router;
