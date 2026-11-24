const router = require('express').Router();
const apiRoutes = require('./api');

// Mount all API endpoints under the /api prefix
router.use('/api', apiRoutes);

// Handle requests to undefined endpoints
router.use((req, res) => {
    return res.status(404).json({
        message: 'Route not found',
    });
});

// Export the main application router
module.exports = router;