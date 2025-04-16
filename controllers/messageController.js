require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');

exports.getMessages = asyncHandler(async(req,res,next) => {
    try {
    const messages = await prisma.Message.findMany();
    res.json(messages);
}
catch (error) {
    next(error);
}
})

exports.newMessage = asyncHandler(async(req,res,next) => {
    const { content } = req.body;
    const username = req.user.username;
    try {
        await prisma.Message.create({
            data:{
                content: content,
                user: username,
            }
        });
        res.status(201).json({message: "Message created successfully"});
    }
    catch(error) {
        console.log(error);
        next(error);
    }
    
})