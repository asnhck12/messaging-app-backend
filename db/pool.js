const { Pool } = require("pg");
require('dotenv').config();

const SQLDB = process.env.SQL_URI;


const newPool = new Pool({
    connectionString: SQLDB
})

module.exports = newPool;