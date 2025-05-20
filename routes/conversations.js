var express = require('express');
var router = express.Router();

const conversation_controller = require("../controllers/conversationController");
const { verifyToken } = require('../middleware/jwtMiddleware');

router.post('/findOrCreate',verifyToken, conversation_controller.findOrCreate);
router.get('/find',verifyToken, conversation_controller.find);

module.exports = router;
