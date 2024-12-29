const express = require('express');
const router = express.Router();

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

module.exports = router;
