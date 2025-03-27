const pool = require("./pool");


//user queries
async function getAllUsers() {
    const { rows } = await pool.query("SELECT * FROM users");    
    return rows;
}

async function insertUser(username,password) {
    await pool.query("INSERT INTO users (username,password) VALUES ($1,$2)", [username,password]);
}

//message queries
async function getAllMessages() {
    const { rows } = await pool.query("SELECT * FROM messages");    
    return rows;
}

async function insertMessage(message) {
    await pool.query("INSERT INTO messages (message) VALUES ($1)", [message]);
}

//export
module.exports = {
    getAllUsers,
    insertUser,
    getAllMessages,
    insertMessage
}