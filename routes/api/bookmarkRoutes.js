const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const { Bookmark } = require('../../models');
const { authMiddleware } = require('../../utils/auth');

// Require authentication for all bookmark endpoints
router.use(authMiddleware);

// Create a bookmark for the authenticated user
router.post('/', async (req, res) => {
    try {
        const { title, url, description } = req.body;

        // Assign ownership using the authenticated user's ID
        const bookmark = await Bookmark.create({
            title,
            url,
            description,
            user: req.user._id,
        });

        return res.status(201).json(bookmark);
    } catch (err) {
        // Handle model validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message,
            });
        }

        return res.status(500).json({
            message: 'Unable to create bookmark',
        });
    }
});

// Retrieve all bookmarks belonging to the authenticated user
router.get('/', async (req, res) => {
    try {
        // Filter bookmarks by ownership
        const bookmarks = await Bookmark.find({
            user: req.user._id,
        });

        return res.status(200).json(bookmarks);
    } catch (err) {
        return res.status(500).json({
            message: 'Unable to retrieve bookmarks',
        });
    }
});

// Retrieve a specific bookmark
router.get('/:id', async (req, res) => {
    try {
        // Validate the bookmark ID
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid bookmark ID',
            });
        }

        const bookmark = await Bookmark.findById(req.params.id);

        // Handle bookmarks that do not exist
        if (!bookmark) {
            return res.status(404).json({
                message: 'Bookmark not found',
            });
        }

        // Verify that the authenticated user owns the bookmark
        if (bookmark.user.toString() !== req.user._id) {
            return res.status(403).json({
                message: 'Access denied',
            });
        }

        return res.status(200).json(bookmark);
    } catch (err) {
        return res.status(500).json({
            message: 'Unable to retrieve bookmark',
        });
    }
});

// Export the protected bookmark router
module.exports = router;