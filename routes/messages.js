var express = require('express');
var router = express.Router();

const message_controller = require("../controllers/messageController");
const { verifyToken } = require('../middleware/jwtMiddleware');

/* GET messages listing. */
router.get('/:conversationId',verifyToken,message_controller.getMessages);

/* POST new users */
router.post('/newmessage',verifyToken,message_controller.newMessage);


module.exports = router;
