var express = require('express');
var router = express.Router();

const user_controller = require("../controllers/userController");

/* GET users listing. */
router.get('/',user_controller.getUsers);

/* POST new users */
router.post('/signup',user_controller.newUser)

module.exports = router;
