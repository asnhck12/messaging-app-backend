var express = require('express');
var router = express.Router();

const message_controller = require("../controllers/messageController");

/* GET messages listing. */
router.get('/',message_controller.getMessages);

/* POST new users */
router.post('/newmessage',message_controller.newMessage)

module.exports = router;
