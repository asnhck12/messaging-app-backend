require("dotenv").config();
const asyncHandler = require("express-async-handler");
const db = require("../db/queries");

exports.getMessages = asyncHandler(async(req,res,next) => {
    try {
    const messages = await db.getAllMessages();
    res.send("Messages: " + messages.map(message => message.message).join(", "));
}
catch (error) {
    next(error);
}
})

exports.newMessage = asyncHandler(async(req,res,next) => {
    const { message } = req.body;
    try {
        await db.insertMessage(message);
        res.redirect("/");
    }
    catch(error) {
        console.log(error);
        next(error);
    }
    
})