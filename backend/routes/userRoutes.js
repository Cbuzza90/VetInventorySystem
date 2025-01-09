const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const db = require('../db'); // Import the centralized DB connection
const router = express.Router();

// Get all users (Manager-only)
router.get('/', authenticateToken, authorizeRole('Manager'), async (req, res) => {
    console.log('GET /users endpoint hit');
    try {
        const [users] = await db.promise().query('SELECT idUser, Username, Role FROM Users');
        console.log('Users fetched:', users);
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});


// Add a new user (Manager-only)
router.post('/', authenticateToken, authorizeRole('Manager'), async (req, res) => {
    const { Username, Password, Role } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);

    try {
        await db.promise().query(
            'INSERT INTO Users (Username, Password, Role) VALUES (?, ?, ?)',
            [Username, hashedPassword, Role]
        );
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ message: 'Error adding user' });
    }
});


// Delete a user (Manager-only)
router.delete('/:id', authenticateToken, authorizeRole('Manager'), async (req, res) => {
    const { id } = req.params;

    try {
        await db.promise().query('DELETE FROM Users WHERE idUser = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
});


// Update user details (Manager-only)
router.put('/users/:id', authenticateToken, authorizeRole('Manager'), async (req, res) => {
    const { id } = req.params;
    const { Username, Role } = req.body;

    try {
        await db.promise().query(
            'UPDATE Users SET Username = ?, Role = ? WHERE idUser = ?',
            [Username, Role, id]
        );
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
});

module.exports = router;
