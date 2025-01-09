const mysql = require('mysql2');
require('dotenv').config();

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Stop the server if the database connection fails
    } else {
        console.log('Connected to the database');
    }
});

module.exports = db;
