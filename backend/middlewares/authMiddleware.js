const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token
    if (!token) {
        console.log('No token provided'); // Debugging
        return res.status(401).json({ message: 'Access Denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Invalid Token:', err.message); // Debugging
            return res.status(403).json({ message: 'Invalid Token' });
        }
        console.log('Authenticated User:', user); // Debugging
        req.user = user; // Attach the decoded token payload
        next();
    });
};

const authorizeRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
    }
    next();
};


module.exports = { authenticateToken, authorizeRole };
