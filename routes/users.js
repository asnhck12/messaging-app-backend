var express = require('express');
var router = express.Router();

const user_controller = require("../controllers/userController");

/* GET users listing. */
router.get('/',user_controller.getUsers);

/* POST new users */
router.post('/signup',user_controller.newUser)

/* GET user login */
router.post('/login',user_controller.userLogin)

/* GET user logout */
router.post('/logout',user_controller.userLogout)

module.exports = router;
