require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/jwtMiddleware');

exports.getUsers = asyncHandler(async(req,res,next) => {
    try {
    const usernames = await prisma.User.findMany();
    res.send("Usernames: " + usernames.map(user => user.username).join(", "));
}
catch (error) {
    next(error);
}
})

exports.newUser = [
    body("username", "Please enter a Username").trim().isLength({ min:2 }).escape(),
    body("password", "Please enter a Password").isLength({ min:8 }).escape(),
    body("confirm_password", "Please confirm your Password").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const userExists = await prisma.User.findUnique({ where: {
                username: req.body.username} });
                    if (userExists) {
                        return res.status(400).json({ errors: [{ msg: "Username already exists" }] });
                    }
        
                    const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
                    const user = await prisma.User.create({
                        data: {
                        username: req.body.username,
                        password: hashedPassword,
                        }
                    });
        
                    res.status(201).json({ message: "User created successfully" });
                } catch (err) {
                    return next(err);
                }
            })]

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