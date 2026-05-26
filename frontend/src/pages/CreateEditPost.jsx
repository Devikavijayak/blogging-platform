import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const CreateEditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading } = useContext(AuthContext);
    const isEdit = Boolean(id);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        if (isEdit) {
            const fetchPost = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
                    setTitle(res.data.title);
                    setContent(res.data.content);
                } catch (err) {
                    console.error(err);
                    setError('Failed to fetch post');
                }
            };
            fetchPost();
        }
    }, [id, isEdit, user, navigate, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/posts/${id}`, { title, content }, { withCredentials: true });
                navigate(`/post/${id}`);
            } else {
                const res = await axios.post('http://localhost:5000/api/posts', { title, content }, { withCredentials: true });
                navigate(`/post/${res.data._id}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        }
    };

    return (
        <motion.div className="glass-panel" style={{ marginTop: '2rem', maxWidth: '800px', margin: '2rem auto' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>{isEdit ? 'Edit Post' : 'Create New Post'}</h1>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Post Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    style={{ fontSize: '1.5rem', padding: '1rem' }}
                />
                <textarea 
                    rows="15" 
                    placeholder="Write your story..." 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    required 
                    style={{ resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">{isEdit ? 'Update Post' : 'Publish Post'}</button>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateEditPost;
