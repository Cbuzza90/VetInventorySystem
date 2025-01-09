const express = require('express');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all categories
router.get('/', authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const [categories] = await db.promise().query('SELECT idCategory, Name FROM Categories');
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err); // Debugging
        res.status(500).json({ message: 'Database error', error: err });
    }
});

// Add a new category
router.post('/', authenticateToken, authorizeRole('Manager'), async (req, res) => {
    const db = req.db;
    const { Name } = req.body;

    console.log('Request Body:', req.body); // Debugging

    if (!Name || !Name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const [result] = await db.promise().query(
            'INSERT INTO Categories (Name) VALUES (?)',
            [Name.trim()]
        );
        res.status(201).json({ message: 'Category added successfully!', id: result.insertId });
    } catch (err) {
        console.error('Database Error:', err); // Debugging
        res.status(500).json({ message: 'Database error', error: err });
    }
});

// Delete a category
router.delete('/:id', authenticateToken, authorizeRole('Manager'), async (req, res) => {
    const db = req.db;
    const { id } = req.params;

    try {
        await db.promise().query('DELETE FROM Categories WHERE idCategory = ?', [id]);
        res.json({ message: 'Category deleted successfully!' });
    } catch (err) {
        console.error('Database Error:', err); // Debugging
        res.status(500).json({ message: 'Database error', error: err });
    }
});

// Update an existing category
router.put('/:id', authenticateToken, authorizeRole('Manager'), async (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { Name } = req.body;

    if (!Name || !Name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        await db.promise().query(
            'UPDATE Categories SET Name = ? WHERE idCategory = ?',
            [Name.trim(), id]
        );
        res.json({ message: 'Category updated successfully!' });
    } catch (err) {
        console.error('Database Error:', err); // Debugging
        res.status(500).json({ message: 'Database error', error: err });
    }
});

module.exports = router;
