const jwt = require('jsonwebtoken');
const blacklist = new Set();
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.error('No token provided');
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Received token:', token);

    if (blacklist.has(token)) {
        console.error('Token is blacklisted');
        return res.status(401).json({ message: 'Token is blacklisted' });
    }

    jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        req.user = decoded;
        req.token = token;
        next();
    });
};

const blacklistToken = (token) => {
    blacklist.add(token);
};

module.exports = { verifyToken, blacklistToken };

