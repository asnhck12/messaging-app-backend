const express = require("express");
const app = express();

var indexRouter = require('./routes');

app.use(express.json());
app.use("/", indexRouter);

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);

module.exports = app;