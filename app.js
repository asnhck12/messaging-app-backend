require("dotenv").config();
const frontend_url = process.env.FRONTEND_URI;
const express = require("express");
const http = require('http');
const { Server} = require('socket.io');
const socket = require('./socket');

console.log('Allowed origin:', frontend_url); // Add this line to debug

const prisma = require('./db/prisma');
const app = express();

const session = require("express-session");
const cors = require('cors');

const server = http.createServer(app);
socket.init(server);

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const passport = require("passport");

var indexRouter = require('./routes');

app.use(cors({ origin: `${frontend_url}`, credentials: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.sessionSecret, resave: false, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.User.findUnique({
        where: {
            username: username,
        },
    })
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      if (user.isDeleted) {
        return done(null, false, { message: "This account has been deactivated" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

app.use(express.json());
app.use("/", indexRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


server.listen(process.env.PORT, () =>
    console.log(`App listening on port 3000!`),
);

module.exports = app;