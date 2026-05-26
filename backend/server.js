require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins for this project (or a specific VERCEL frontend URL if you know it)
        callback(null, true);
    },
    credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;
        
        // If the URI is missing or it's the default fake one, use the local database instead
        if (!uri || uri.includes('test:test')) {
            uri = 'mongodb://127.0.0.1:27017/blogging';
        }
        
        await mongoose.connect(uri);
        console.log(`Connected to MongoDB (${uri.includes('127.0.0.1') ? 'Local' : 'Atlas'})`);

        // Seed Dummy User and Post
        const userExists = await User.findOne({ username: 'demouser' });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = await User.create({ username: 'demouser', password: hashedPassword });
            await Post.create({ title: 'Welcome to NexusBlog!', content: 'This is a test post to show that the app is working. Feel free to edit or delete it.', author: user._id });
            console.log('--------------------------------------------------');
            console.log('Dummy User Created -> Username: demouser | Password: password123');
            console.log('--------------------------------------------------');
        }

    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
