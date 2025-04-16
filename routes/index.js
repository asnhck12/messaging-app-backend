var express = require('express');
var router = express.Router();
const {verifyToken} = require('../middleware/jwtMiddleware');

var userRouter = require('./users');
var messageRouter = require('./messages');

// Attach all routes
router.use("/users", userRouter);
router.use("/messages", verifyToken, messageRouter);

module.exports = router;
