const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware'); // Add this line

// Update Variant
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { Name, Quantity } = req.body;
    const db = req.db;

    console.log(`PUT request received for variant ID: ${id}`); // Debugging log
    console.log('Request body:', req.body); // Debugging log

    db.query(
        'UPDATE Variants SET Name = ?, Quantity = ? WHERE idVariant = ?',
        [Name, Quantity, id],
        (err) => {
            if (err) {
                console.error('Database error:', err); // Debugging log
                res.status(500).send('Database error');
            } else {
                res.status(200).json({ message: 'Variant updated successfully' });
            }
        }
    );
});

// Update variant quantity
router.put('/:id/quantity', authenticateToken, authorizeRole('Manager'), (req, res) => {
    const db = req.db;
    const { id } = req.params;
    const { increment } = req.body;

    db.query(
        'UPDATE Variants SET Quantity = Quantity + ? WHERE idVariant = ?',
        [increment, id],
        (err, results) => {
            if (err) {
                console.error('Error updating variant quantity:', err);
                res.status(500).send(err);
            } else {
                db.query('SELECT * FROM Variants WHERE idVariant = ?', [id], (err, updatedVariant) => {
                    if (err || !updatedVariant.length) {
                        res.status(500).send('Error fetching updated variant');
                    } else {
                        res.json(updatedVariant[0]); // Return the updated variant
                    }
                });
            }
        }
    );
});

// Add a new variant
router.post('/', (req, res) => {
    const db = req.db;
    const { name, quantity, idItem } = req.body;

    console.log("Received payload:", req.body);

    if (!name || quantity === undefined || !idItem) {
        console.error("Invalid payload:", req.body);
        return res.status(400).json({ message: 'Missing required fields: name, quantity, or idItem' });
    }

    db.query(
        'INSERT INTO Variants (name, quantity, idItem) VALUES (?, ?, ?)',
        [name, quantity, idItem],
        (err, results) => {
            if (err) {
                console.error('Error inserting variant:', err);
                return res.status(500).send(err);
            }
            res.json({ message: 'Variant added successfully!', id: results.insertId });
        }
    );
});





module.exports = router;
