var express = require('express');
var router = express.Router();
const {verifyToken} = require('../middleware/jwtMiddleware');

var userRouter = require('./users');
var messageRouter = require('./messages');
var conversationRouter = require('./conversations')
var profileRouter = require('./profile')

// Attach all routes
router.use("/users", userRouter);
router.use("/messages", verifyToken, messageRouter);
router.use("/conversations", verifyToken, conversationRouter);
router.use("/profile", verifyToken, profileRouter);

module.exports = router;
