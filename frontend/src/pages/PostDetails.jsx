import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Share2 } from 'lucide-react';

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [similarPosts, setSimilarPosts] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchComments = async () => {
            try {
                const res = await axios.get(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}/comments`);
                setComments(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchSimilar = async () => {
            try {
                const res = await axios.get(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}/similar`);
                setSimilarPosts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPost();
        fetchComments();
        fetchSimilar();
    }, [id]);

    const handleDeletePost = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}`, { withCredentials: true });
                navigate('/');
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}/comments`, { content: newComment }, { withCredentials: true });
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleReply = async (e, parentId) => {
        e.preventDefault();
        try {
            const res = await axios.post(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}/comments`, { content: replyContent, parentComment: parentId }, { withCredentials: true });
            setComments([res.data, ...comments]);
            setReplyingTo(null);
            setReplyContent('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`https://blogging-platform-h7ur.onrender.com/api/posts/comments/${commentId}`, { withCredentials: true });
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpvote = async () => {
        if (!user) return alert('Please login to vote');
        try {
            const res = await axios.put(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}/upvote`, {}, { withCredentials: true });
            setPost(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownvote = async () => {
        if (!user) return alert('Please login to vote');
        try {
            const res = await axios.put(`https://blogging-platform-h7ur.onrender.com/api/posts/${id}/downvote`, {}, { withCredentials: true });
            setPost(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!post) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const karma = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
    const hasUpvoted = user && post.upvotes?.includes(user.id);
    const hasDownvoted = user && post.downvotes?.includes(user.id);

    const topLevelComments = comments.filter(c => !c.parentComment);
    const getReplies = (parentId) => comments.filter(c => c.parentComment === parentId);

    const CommentNode = ({ comment }) => {
        const replies = getReplies(comment._id);
        return (
            <div className="comment" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="comment-author">{comment.author?.username}</div>
                        <div className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</div>
                        <p style={{ marginTop: '0.5rem' }}>{comment.content}</p>
                    </div>
                    {user && user.id === comment.author?._id && (
                        <button onClick={() => handleDeleteComment(comment._id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.5rem', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                
                {user && (
                    <button onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} style={{ background: 'transparent', color: 'var(--primary-color)', fontSize: '0.9rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                        Reply
                    </button>
                )}

                {replyingTo === comment._id && (
                    <form onSubmit={(e) => handleReply(e, comment._id)} style={{ marginTop: '1rem' }}>
                        <textarea rows="2" placeholder="Write a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} />
                        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>Post Reply</button>
                    </form>
                )}

                {replies.length > 0 && (
                    <div style={{ marginLeft: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--glass-border)', marginTop: '1rem' }}>
                        {replies.map(reply => <CommentNode key={reply._id} comment={reply} />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div className="single-post" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
                &larr; Back to Home
            </Link>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)', padding: '1rem 0.5rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                    <motion.button whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.8 }} onClick={handleUpvote} style={{ background: 'transparent', color: hasUpvoted ? '#ef4444' : '#94a3b8' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 4l-8 8h16l-8-8z" /></svg>
                    </motion.button>
                    <AnimatePresence mode="wait">
                        <motion.span key={karma} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: karma > 0 ? '#ef4444' : karma < 0 ? '#6366f1' : 'var(--text-color)' }}>
                            {karma}
                        </motion.span>
                    </AnimatePresence>
                    <motion.button whileHover={{ scale: 1.2, y: 2 }} whileTap={{ scale: 0.8 }} onClick={handleDownvote} style={{ background: 'transparent', color: hasDownvoted ? '#6366f1' : '#94a3b8' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill={hasDownvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 20l8-8H4l8 8z" /></svg>
                    </motion.button>
                </div>
                
                <div style={{ flex: 1 }}>
                    <h1 className="single-post-title">{post.title}</h1>
                    <div className="post-meta" style={{ fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}</span>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem 1rem', borderRadius: '2rem', color: 'var(--text-color)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
                            <Share2 size={16} /> Share
                        </motion.button>
                    </div>
                    
                    {user && user.id === post.author._id && (
                        <div className="action-buttons">
                            <Link to={`/edit/${post._id}`} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Edit2 size={18} /> Edit
                            </Link>
                            <button onClick={handleDeletePost} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trash2 size={18} /> Delete
                            </button>
                        </div>
                    )}

                    <div className="single-post-content">{post.content}</div>
                </div>
            </div>

            <div className="comments-section">
                <h3>Comments ({comments.length})</h3>
                {user ? (
                    <form onSubmit={handleAddComment} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                        <textarea 
                            rows="3" 
                            placeholder="Add a comment..." 
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="btn-primary">Post Comment</button>
                    </form>
                ) : (
                    <p style={{ margin: '1.5rem 0', color: '#94a3b8' }}>Please <Link to="/login" style={{ color: 'var(--primary-color)' }}>login</Link> to leave a comment.</p>
                )}

                <div>
                    {topLevelComments.map(comment => (
                        <CommentNode key={comment._id} comment={comment} />
                    ))}
                </div>
            </div>

            {similarPosts.length > 0 && (
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--primary-color)' }}>Similar Blogs You Might Like</h3>
                    <div className="post-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                        {similarPosts.map(sp => (
                            <Link to={`/post/${sp._id}`} key={sp._id}>
                                <motion.div 
                                    className="glass-panel post-card"
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(99,102,241,0.2)" }}
                                    style={{ padding: '1.5rem', minHeight: '150px' }}
                                >
                                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>{sp.title}</h4>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        By {sp.author?.username} • {new Date(sp.createdAt).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PostDetails;
