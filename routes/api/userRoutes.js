const router = require('express').Router();
const passport = require('../../config/passport');
const { User } = require('../../models');
const { signToken } = require('../../utils/auth');

// Register a new local user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Require all local registration fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required',
            });
        }

        // Create the user and hash the password through the model
        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate a JWT for the newly registered user
        const token = signToken(user);

        // Return user information without the password
        return res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        // Handle duplicate usernames or email addresses
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Username or email already exists',
            });
        }

        // Handle model validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message,
            });
        }

        return res.status(500).json({
            message: 'Unable to register user',
        });
    }
});

// Authenticate an existing local user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Require both login credentials
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
            });
        }

        // Retrieve the user and explicitly include the password
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select('+password');

        // Reject invalid credentials and accounts without local passwords
        if (!user || !(await user.isCorrectPassword(password))) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        // Generate a JWT after successful authentication
        const token = signToken(user);

        // Return authenticated user information without the password
        return res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Unable to log in',
        });
    }
});

// Initiate GitHub OAuth authentication
router.get(
    '/auth/github',
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false,
    })
);

// Handle the GitHub OAuth callback
router.get(
    '/auth/github/callback',
    passport.authenticate('github', {
        session: false,
        failureRedirect: '/api/users/auth/github/failure',
    }),
    (req, res) => {
        // Generate a JWT for the authenticated GitHub user
        const token = signToken(req.user);

        // Prevent the authentication response from being cached
        res.set('Cache-Control', 'no-store');

        // Return the JWT and authenticated user information
        return res.status(200).json({
            token,
            user: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email,
            },
        });
    }
);

// Handle unsuccessful GitHub authentication
router.get('/auth/github/failure', (req, res) => {
    return res.status(401).json({
        message: 'GitHub authentication failed',
    });
});

// Export the user authentication router
module.exports = router;