const mongoose = require('mongoose');
require('dotenv').config();

// Establish a connection to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Log a successful database connection
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Handle database connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

module.exports = mongoose.connection;