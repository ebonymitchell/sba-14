const { Schema, model } = require('mongoose');

// Define the structure of a user's personal bookmark
const bookmarkSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        // Associate each bookmark with its owner
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        // Automatically track creation and modification dates
        timestamps: true,
    }
);

// Create the Bookmark model
const Bookmark = model('Bookmark', bookmarkSchema);

module.exports = Bookmark;