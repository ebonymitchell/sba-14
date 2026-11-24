const router = require('express').Router();
const userRoutes = require('./userRoutes');
const bookmarkRoutes = require('./bookmarkRoutes');

// Mount user authentication endpoints
router.use('/users', userRoutes);

// Mount protected bookmark endpoints
router.use('/bookmarks', bookmarkRoutes);

// Export the API router
module.exports = router;