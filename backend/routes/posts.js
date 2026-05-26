const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get similar posts
router.get('/:id/similar', async (req, res) => {
    try {
        const similarPosts = await Post.find({ _id: { $ne: req.params.id } })
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .limit(3);
        res.json(similarPosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create post
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = new Post({ title, content, author: req.user.id });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update post
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Upvote post
router.put('/:id/upvote', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        // Remove from downvotes if exists
        post.downvotes = post.downvotes.filter(id => id.toString() !== req.user.id);
        
        // Toggle upvote
        if (post.upvotes.includes(req.user.id)) {
            post.upvotes = post.upvotes.filter(id => id.toString() !== req.user.id);
        } else {
            post.upvotes.push(req.user.id);
        }
        
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Downvote post
router.put('/:id/downvote', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        
        // Remove from upvotes if exists
        post.upvotes = post.upvotes.filter(id => id.toString() !== req.user.id);
        
        // Toggle downvote
        if (post.downvotes.includes(req.user.id)) {
            post.downvotes = post.downvotes.filter(id => id.toString() !== req.user.id);
        } else {
            post.downvotes.push(req.user.id);
        }
        
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        await post.deleteOne();
        await Comment.deleteMany({ post: post._id }); // Delete associated comments
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Comments ---

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id }).populate('author', 'username').sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { content, parentComment } = req.body;
        const comment = new Comment({ 
            content, 
            post: req.params.id, 
            author: req.user.id,
            parentComment: parentComment || null 
        });
        await comment.save();
        await comment.populate('author', 'username');
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete comment
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.author.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
