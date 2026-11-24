const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
const { User } = require('../models');

// Configure the GitHub OAuth authentication strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            scope: ['user:email'],
            // Enable state validation to protect against CSRF attacks
            state: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find returning GitHub users
                const existingUser = await User.findOne({
                    githubId: profile.id,
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                // Retrieve verified email addresses from GitHub
                const response = await fetch(
                    'https://api.github.com/user/emails',
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Accept: 'application/vnd.github+json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Unable to retrieve GitHub email addresses');
                }

                const emails = await response.json();

                // Require a verified primary email address
                const verifiedEmail = emails.find(
                    (email) => email.primary && email.verified
                );

                if (!verifiedEmail) {
                    return done(null, false, {
                        message: 'A verified GitHub email is required',
                    });
                }

                const email = verifiedEmail.email.toLowerCase().trim();

                // Find an existing account by email
                const localUser = await User.findOne({ email });

                if (localUser) {
                    // Prevent linking an account to multiple GitHub identities
                    if (localUser.githubId) {
                        return done(null, false, {
                            message: 'Account is linked to another GitHub user',
                        });
                    }

                    // Link the existing account to GitHub
                    localUser.githubId = profile.id;
                    await localUser.save();

                    return done(null, localUser);
                }

                // Generate a unique username
                let username = profile.username || `github-${profile.id}`;
                let counter = 1;
                const baseUsername = username;

                while (await User.exists({ username })) {
                    username = `${baseUsername}-${counter}`;
                    counter++;
                }

                // Create a new GitHub user
                const newUser = await User.create({
                    username,
                    githubId: profile.id,
                    email,
                });

                return done(null, newUser);
            } catch (err) {
                return done(err);
            }
        }
    )
);

// Export the configured Passport instance
module.exports = passport;