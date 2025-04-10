require("dotenv").config();
const asyncHandler = require("express-async-handler");
const prisma = require('../db/prisma');
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/jwtMiddleware');

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
        const userExists = await prisma.users.findUnique({
            where: {
                username: username,
            },
        })
        if (!userExists) {
            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.users.create({
                data:{
                    username: username,
                    password: hashedPassword,
                }
            })
        res.redirect("/");
        }
        else {
            res.send("User already exists");
        }
    }
    catch(error) {
        next(error);
    }
    
})

exports.userLogin = (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        try {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: "Wrong username or password" });
            }
            req.logIn(user, async (err) => {
                if (err) {
                    return next(err);
                }
                const token = jwt.sign({ user }, process.env.jwtSecret);

                return res.status(200).json({ message: "Login successful", token });
            });
        } catch (err) {
            return next(err);
        }
    })(req, res, next);
};

exports.userLogout = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    blacklistToken(token);

    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
});