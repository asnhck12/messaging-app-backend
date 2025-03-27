var express = require('express');
var router = express.Router();

var userRouter = require('./users');
var messageRouter = require('./messages');

// Attach all routes
router.use("/users", userRouter);
router.use("/messages", messageRouter);

module.exports = router;
