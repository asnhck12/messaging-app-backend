require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/jwtMiddleware');

exports.getUsers = asyncHandler(async(req,res,next) => { 
    try { 
        const usernames = await prisma.user.findMany({
            where: {
              id: { not: req.userId }
            },
            select: {
              username: true,
              id: true,
              conversations: true,
              messages: true
            }
          });

    res.json(usernames);
}
catch (error) {
    next(error);
}
})

exports.newUser = [
  body("username", "Please enter a Username")
    .trim()
    .toLowerCase()
    .isLength({ min: 2 })
    .escape(),
  body("password", "Please enter a Password")
    .isLength({ min: 8 })
    .escape(),
  body("confirm_password", "Please confirm your Password").custom(
    (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }
  ),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const normalizedUsername = req.body.username.trim().toLowerCase();

    try {
      const userExists = await prisma.user.findUnique({
        where: { username: normalizedUsername },
      });

      if (userExists) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Username already exists" }] });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = await prisma.user.create({
        data: {
          username: normalizedUsername,
          password: hashedPassword,
          isGuest: false,
          profile: {
            create: {},
          },
        },
      });

      const globalChat = await prisma.conversation.findUnique({
        where: { name: "Global Chat" },
      });

      if (globalChat) {
        await prisma.conversationParticipant.create({
          data: {
            userId: newUser.id,
            conversationId: globalChat.id,
          },
        });
      }

      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      if (err.code === "P2002" && err.meta?.target?.includes("username")) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Username already exists" }] });
      }
      return next(err);
    }
  }),
];


exports.userLogin = (req, res, next) => {
    if (req.body.username) {
        req.body.username = req.body.username.toLowerCase();
    }

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
                const token = jwt.sign({ id: user.id }, process.env.jwtSecret, { expiresIn: "1d" });

                return res.status(200).json({ message: "Login successful", token, userId: user.id });
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

exports.guestLogin = asyncHandler(async(req, res, next) => {
    try {

        const guestUsername = `Guest_${crypto.randomBytes(2).toString('hex')}`;
    const dummyPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);


        const guestUser = await prisma.User.create({
            data:{
                username: guestUsername,
                isGuest: true,
                password: hashedPassword,
                profile: {
                        create: {},
                    },
            }
        });
        
        const token = jwt.sign(
            { id: guestUser.id },
             process.env.jwtSecret,
            { expiresIn: '2h' }
    );
    
    res.json({ token, user: guestUser });} 
        catch (err) {
            return next(err);
        }
    })