const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
const expiration = '2h';

// Generate a signed JWT for an authenticated user
const signToken = function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, {
        expiresIn: expiration,
    });
};

// Verify the JWT before allowing access to protected routes
const authMiddleware = function (req, res, next) {
    const authHeader = req.headers.authorization;

    // Reject requests without a Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authentication required',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token and attach user information to the request
        const { data } = jwt.verify(token, secret, {
            algorithms: ['HS256'],
        });

        req.user = data;

        return next();
    } catch (err) {
        // Reject invalid or expired tokens
        return res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
};

// Export authentication utilities for use throughout the application
module.exports = { signToken, authMiddleware };