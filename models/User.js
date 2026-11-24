const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
        type: String,
        required: function () {
            return !this.githubId;
        },
        minlength: 5,
        select: false,
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true,
    },
});

// Hash the password before saving
userSchema.pre('save', async function () {
    if (this.password && this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
});

// Compare passwords during login
userSchema.methods.isCorrectPassword = async function (password) {
    if (!this.password) {
        return false;
    }

    return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema);

module.exports = User;