const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Make the database accessible to all routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Import Routes
const categoryRoutes = require('./routes/categories');
const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/authRoutes');

// Use Routes
app.use('/categories', categoryRoutes);
app.use('/items', itemRoutes);
app.use('/', authRoutes);

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
