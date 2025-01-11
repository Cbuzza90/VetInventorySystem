const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Import the centralized database connection
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categories');
const subcategoriesRoutes = require('./routes/subcategories');
const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Attach the database connection to requests
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Routes
app.use('/categories', categoryRoutes);
app.use('/subcategories', subcategoriesRoutes);
app.use('/items', itemRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the Backend API!');
});

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).send('Route not found');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
