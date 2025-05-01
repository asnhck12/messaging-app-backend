var express = require('express');
var router = express.Router();

const profile_controller = require("../controllers/profileController");
const { verifyToken } = require('../middleware/jwtMiddleware');

router.get('/users/:userId',verifyToken, profile_controller.getProfile);

router.get('/myProfile',verifyToken,profile_controller.getMyProfile);

router.post('/update',verifyToken,profile_controller.updateProfile);

module.exports = router;
