require("dotenv").config();
const express = require("express");
const prisma = require('./db/prisma');
const app = express();

const session = require("express-session");
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const passport = require("passport");
// const User = require("./prisma/")

var indexRouter = require('./routes');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.sessionSecret, resave: false, saveUninitialized: true }));

// async function main() {
//     const allUsers = await prisma.users.findMany();
//     console.log(allUsers);
// }

// main()
// .then(async () => {
//     await prisma.$disconnect()
// })
// .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
// })


app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: {
            username: username,
        },
    })
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
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

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);

module.exports = app;