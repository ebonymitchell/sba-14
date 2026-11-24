require('dotenv').config();

const express = require('express');
const session = require('express-session');
const db = require('./config/connection');
const passport = require('./config/passport');
const routes = require('./routes');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure temporary sessions for OAuth state validation
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 10 * 60 * 1000,
        },
    })
);

// Initialize Passport for GitHub authentication
app.use(passport.initialize());

// Provide a basic endpoint to verify server availability
app.get('/', (req, res) => {
    res.json({ message: 'Secure Web Portal API is running' });
});

// Mount application routes
app.use(routes);

// Start the server after the database connection is established
db.once('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});