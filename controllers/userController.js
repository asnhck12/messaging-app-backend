require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');

exports.getUsers = asyncHandler(async(req,res,next) => {
    try {
    const usernames = await prisma.users.findMany();
    res.send("Usernames: " + usernames.map(user => user.username).join(", "));
}
catch (error) {
    next(error);
}
})

exports.newUser = asyncHandler(async(req,res,next) => {
    const { username,password } = req.body;
    try {
        await prisma.users.create({
            data:{
                username: username,
                password: password
            }
        })
        res.redirect("/");
    }
    catch(error) {
        next(error);
    }
    
})