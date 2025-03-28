require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');

exports.getMessages = asyncHandler(async(req,res,next) => {
    try {
    const messages = await prisma.messages.findMany();
    res.send("Messages: " + messages.map(message => message.message).join(", "));
}
catch (error) {
    next(error);
}
})

exports.newMessage = asyncHandler(async(req,res,next) => {
    const { message } = req.body;
    try {
        await prisma.messages.create({
            data:{
                message:message
            }
        });
        res.redirect("/");
    }
    catch(error) {
        console.log(error);
        next(error);
    }
    
})