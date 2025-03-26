require("dotenv").config();
const asyncHandler = require("express-async-handler");
const db = require("../db/queries");

exports.getUsers = asyncHandler(async(req,res,next) => {
    try {
    const usernames = await db.getAllUsers();
    res.send("Usernames: " + usernames.map(user => user.username).join(", "));
}
catch (error) {
    next(error);
}
})

exports.newUser = asyncHandler(async(req,res,next) => {
    const { username,password } = req.body;
    try {
        await db.insertUser(username, password);
        res.redirect("/");
    }
    catch(error) {
        next(error);
    }
    
})