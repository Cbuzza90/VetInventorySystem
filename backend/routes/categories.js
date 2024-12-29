const express = require('express');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
    const db = req.db;
    db.query('SELECT * FROM Categories', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Add a new category
router.post('/', authenticateToken, authorizeRole('Manager'), (req, res) => {
    const db = req.db;
    const { Name } = req.body;

    db.query('INSERT INTO Categories (Name) VALUES (?)', [Name], (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Database error', error: err });
        } else {
            res.json({ message: 'Category added successfully!', id: results.insertId });
        }
    });
});

// Search categories
router.get('/search', (req, res) => {
    const db = req.db;
    const { q } = req.query;

    db.query('SELECT * FROM Categories WHERE Name LIKE ?', [`%${q}%`], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Delete a category
router.delete('/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.query('DELETE FROM Categories WHERE idCategory = ?', [id], (err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ message: 'Category deleted successfully!' });
        }
    });
});

// Update an existing category
router.put('/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { Name } = req.body;

    if (!Name || !Name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    db.query(
        'UPDATE Categories SET Name = ? WHERE idCategory = ?',
        [Name, id],
        (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ message: 'Category updated successfully!' });
            }
        }
    );
});

module.exports = router;
