const multer = require('multer');
const path = require('path');

var express = require('express');
var router = express.Router();

const message_controller = require("../controllers/messageController");
const { verifyToken } = require('../middleware/jwtMiddleware');

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* GET messages listing. */
router.get('/:conversationId',verifyToken,message_controller.getMessages);

/* POST new users */
router.post('/newmessage',verifyToken,upload.single("image"), message_controller.newMessage);

/* POST mark messages as read. */
router.post('/markasread',verifyToken,message_controller.markAsRead);


module.exports = router;
