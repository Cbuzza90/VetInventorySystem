const express = require('express');
const router = express.Router();

// Add a new item
router.post('/', (req, res) => {
    const db = req.db;
    const { Name, Quantity, SubcategoryId } = req.body;

    db.query(
        'INSERT INTO Items (Name, Quantity, SubcategoryId) VALUES (?, ?, ?)',
        [Name, Quantity, SubcategoryId],
        (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ message: 'Item added successfully!', id: results.insertId });
            }
        }
    );
});

// Update an item
router.put('/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { Name, Quantity } = req.body;

    db.query(
        'UPDATE Items SET Name = ?, Quantity = ? WHERE idItem = ?',
        [Name, Quantity, id],
        (err) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ message: 'Item updated successfully!' });
            }
        }
    );
});

// Delete an item
router.delete('/:id', (req, res) => {
    const db = req.db;
    const { id } = req.params;

    db.query('DELETE FROM Items WHERE idItem = ?', [id], (err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ message: 'Item deleted successfully!' });
        }
    });
});

// Get items by subcategory ID
router.get('/:subcategoryId', (req, res) => {
    console.log('Request received at /items/:subcategoryId');
    console.log('Fetching items for subcategory ID:', req.params.subcategoryId);

    const db = req.db;
    const { subcategoryId } = req.params;

    db.query(
        'SELECT * FROM Items WHERE idSubcategory = ?',
        [subcategoryId],
        (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                res.status(500).json({ message: 'Internal server error' });
            } else if (results.length === 0) {
                console.log('No items found for subcategory ID:', subcategoryId);
                res.status(404).json({ message: 'No items found for this subcategory.' });
            } else {
                console.log('Items fetched successfully:', results);
                res.json(results);
            }
        }
    );
});


module.exports = router;
