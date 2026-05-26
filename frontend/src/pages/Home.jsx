import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [sortBy, setSortBy] = useState('new'); // 'new', 'hot', 'top'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('https://blogging-platform-h7ur.onrender.com/api/posts');
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPosts();
    }, []);

    const getKarma = (post) => (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

    const sortedPosts = [...posts].sort((a, b) => {
        if (sortBy === 'new') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'top') return getKarma(b) - getKarma(a);
        if (sortBy === 'hot') {
            // Simple hot algorithm: karma + recency bonus
            const scoreA = getKarma(a) + (new Date(a.createdAt).getTime() / 1000000000);
            const scoreB = getKarma(b) + (new Date(b.createdAt).getTime() / 1000000000);
            return scoreB - scoreA;
        }
        return 0;
    });

    const filteredPosts = sortedPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <motion.h1 
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ marginTop: '3rem', fontSize: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
                Explore Knowledge
            </motion.h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                {['new', 'hot', 'top'].map((type) => (
                    <motion.button 
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSortBy(type)}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '2rem',
                            border: '1px solid var(--glass-border)',
                            background: sortBy === type ? 'var(--primary-color)' : 'var(--glass-bg)',
                            color: 'white',
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                            boxShadow: sortBy === type ? '0 0 15px rgba(99, 102, 241, 0.5)' : 'none',
                            transition: 'all 0.3s'
                        }}
                    >
                        {type === 'hot' ? '🔥 ' : type === 'top' ? '⭐ ' : '✨ '}{type}
                    </motion.button>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                <input 
                    type="text"
                    placeholder="Search blogs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '2rem',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-color)',
                        width: '100%',
                        maxWidth: '500px',
                        outline: 'none',
                        fontSize: '1rem'
                    }}
                />
            </div>

            <div className="post-grid">
                {filteredPosts.map((post, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={post._id}
                    >
                        <Link to={`/post/${post._id}`}>
                            <motion.div 
                                className="glass-panel post-card"
                                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(99,102,241,0.2)" }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <h2 className="post-title">{post.title}</h2>
                                <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4l-8 8h16l-8-8z" /></svg>
                                        {getKarma(post)}
                                    </span>
                                </div>
                                <p className="post-excerpt">{post.content.substring(0, 150)}...</p>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Home;
