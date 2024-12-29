const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const router = express.Router();

// Add New User (Manager-only)
router.post('/register', authenticateToken, authorizeRole('Manager'), (req, res) => {
    const db = req.db;
    const { Username, Password, Role } = req.body;

    // Input validation
    if (!Username || !Password || !Role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['User', 'Manager'].includes(Role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Hash password
    bcrypt.hash(Password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({ message: 'Error hashing password', error: err });
        } else {
            // Insert user into the database
            db.query(
                'INSERT INTO Users (Username, Password, Role) VALUES (?, ?, ?)',
                [Username, hash, Role],
                (err) => {
                    if (err) {
                        res.status(500).json({ message: 'Database error', error: err });
                    } else {
                        res.status(201).json({ message: 'User created successfully' });
                    }
                }
            );
        }
    });
});

router.post('/login', (req, res) => {
    const db = req.db;
    const { Username, Password } = req.body;

    if (!Username || !Password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    db.query('SELECT * FROM Users WHERE Username = ?', [Username], async (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Database error', error: err });
        } else if (results.length === 0) {
            res.status(401).json({ message: 'Invalid username or password' });
        } else {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(Password, user.Password);

            if (!passwordMatch) {
                res.status(401).json({ message: 'Invalid username or password' });
            } else {
                const token = jwt.sign(
                    { id: user.idUser, role: user.Role },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                res.status(200).json({ token });
            }
        }
    });
});
module.exports = router;
