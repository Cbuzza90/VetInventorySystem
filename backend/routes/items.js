const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware'); // Add this line


// Add a new item
router.post('/', (req, res) => {
    const db = req.db;
    const { Name, Quantity, idSubcategory, hasVariants, variants } = req.body;

    db.query(
        'INSERT INTO Items (Name, Quantity, idSubcategory) VALUES (?, ?, ?)',
        [Name, Quantity, idSubcategory],
        (err, results) => {
            if (err) {
                console.error('Error inserting item:', err);
                return res.status(500).send(err);
            }

            const itemId = results.insertId;

            if (hasVariants && variants && variants.length > 0) {
                // Insert variants for the newly created item
                const variantInserts = variants.map(variant => [
                    variant.name,
                    variant.quantity,
                    itemId,
                ]);

                db.query(
                    'INSERT INTO Variants (name, quantity, idItem) VALUES ?',
                    [variantInserts],
                    (variantErr) => {
                        if (variantErr) {
                            console.error('Error inserting variants:', variantErr);
                            return res.status(500).send(variantErr);
                        }

                        res.json({
                            message: 'Item and variants added successfully!',
                            id: itemId,
                        });
                    }
                );
            } else {
                res.json({ message: 'Item added successfully!', id: itemId });
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
            i.idItem, 
            i.Name, 
            i.Quantity, 
            CASE 
                WHEN EXISTS (SELECT 1 FROM Variants v WHERE v.idItem = i.idItem) THEN 1 
                ELSE 0 
            END AS hasVariants
        FROM Items i
        WHERE i.idSubcategory = ?;
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


// Get variants by item ID
router.get('/variants/:itemId', (req, res) => {
    const db = req.db;
    const { itemId } = req.params;

    db.query(
        'SELECT * FROM Variants WHERE idItem = ?',
        [itemId],
        (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                res.status(500).send(err);
            } else if (results.length === 0) {
                console.log(`No variants found for item ID: ${itemId}`);
                res.status(404).json({ message: 'No variants found for this item.' });
            } else {
                console.log(`Variants fetched successfully for item ID ${itemId}:`, results);
                res.json(results);
            }
        }
    );
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

module.exports = router;
