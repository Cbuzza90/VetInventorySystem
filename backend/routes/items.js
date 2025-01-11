const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Add a new item
router.post('/', (req, res) => {
    const db = req.db;
    const { Name, Quantity, idSubcategory } = req.body;

    db.query(
        'INSERT INTO Items (Name, Quantity, idSubcategory) VALUES (?, ?, ?)',
        [Name, Quantity, idSubcategory],
        (err, results) => {
            if (err) {
                console.error('Error inserting item:', err);
                return res.status(500).send(err);
            }

            res.json({ message: 'Item added successfully!', id: results.insertId });
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
                console.error('Error updating item:', err);
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
            console.error('Error deleting item:', err);
            res.status(500).send(err);
        } else {
            res.json({ message: 'Item deleted successfully!' });
        }
    });
});

// Get items by subcategory ID
router.get('/:subcategoryId', (req, res) => {
    const { subcategoryId } = req.params;
    const db = req.db;

    const query = `
        SELECT 
            idItem, 
            Name, 
            Quantity
        FROM Items
        WHERE idSubcategory = ?;
    `;

    db.query(query, [subcategoryId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results);
        }
    });
});

// Update item quantity
router.put('/:id/quantity', authenticateToken, authorizeRole('Manager'), (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { increment } = req.body;

    db.query(
        'UPDATE Items SET Quantity = Quantity + ? WHERE idItem = ?',
        [increment, id],
        (err, results) => {
            if (err) {
                console.error('Error updating item quantity:', err);
                res.status(500).send(err);
            } else {
                db.query('SELECT * FROM Items WHERE idItem = ?', [id], (err, updatedItem) => {
                    if (err || !updatedItem.length) {
                        res.status(500).send('Error fetching updated item');
                    } else {
                        res.json(updatedItem[0]); // Return the updated item
                    }
                });
            }
        }
    );
});

// Get all items
router.get('/', (req, res) => {
    const db = req.db;

    const query = `
        SELECT 
            idItem, 
            Name, 
            Quantity, 
            idSubcategory
        FROM Items;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results);
        }
    });
});

module.exports = router;
