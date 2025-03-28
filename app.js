const express = require("express");
const app = express();

var indexRouter = require('./routes');

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

app.use(express.json());
app.use("/", indexRouter);

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);

module.exports = app;