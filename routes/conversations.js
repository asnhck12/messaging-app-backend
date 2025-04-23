var express = require('express');
var router = express.Router();

const conversation_controller = require("../controllers/conversationController");

router.post('/findOrCreate',conversation_controller.findOrCreate);

module.exports = router;
