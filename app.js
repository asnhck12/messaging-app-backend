const express = require("express");
const app = express();

var userRouter = require('./routes/users');

app.use(express.json());
app.use("/", userRouter);

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
  );
  
//   module.exports = app;