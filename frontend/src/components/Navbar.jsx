import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PenSquare, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="nav-logo">NexusBlog</Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <PenSquare size={18} /> Write
                            </Link>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                                <User size={18} /> {user.username}
                            </span>
                            <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
