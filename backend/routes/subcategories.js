const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Delete a subcategory
router.delete('/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    db.query('DELETE FROM Subcategories WHERE idSubcategory = ?', [id], (err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ message: 'Subcategory deleted successfully!' });
        }
    });
});

// Add a new subcategory
router.post('/', authenticateToken, authorizeRole('Manager'), (req, res) => {
    const db = req.db;
    const { Name, idCategory } = req.body;

    console.log('Request Body:', req.body); // Log the incoming request

    // Validate input
    if (!Name || !idCategory) {
        return res.status(400).json({ message: 'Name and idCategory are required' });
    }

    db.query(
        'INSERT INTO Subcategories (Name, idCategory) VALUES (?, ?)',
        [Name.trim(), idCategory],
        (err, results) => {
            if (err) {
                console.error('Database Error:', err); // Log database error
                res.status(500).json({ message: 'Database error', error: err });
            } else {
                console.log('Subcategory added with ID:', results.insertId); // Log success
                res.status(201).json({ message: 'Subcategory added successfully!', id: results.insertId });
            }
        }
    );
});


// Get subcategories by category ID
router.get('/:idCategory', (req, res) => {
    if (!req.db) {
        console.error('Database connection is missing in the request');
        return res.status(500).json({ message: 'Internal server error: database not connected' });
    }

    console.log('Fetching subcategories for idCategory:', req.params.idCategory);
    const db = req.db;
    const { idCategory } = req.params;

    db.query('SELECT * FROM Subcategories WHERE idCategory = ?', [idCategory], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send(err);
        } else if (results.length === 0) {
            console.log('No subcategories found for this category.');
            res.status(404).json({ message: 'No subcategories found for this category.' });
        } else {
            console.log('Subcategories fetched:', results);
            res.json(results);
        }
    });
});





module.exports = router;
