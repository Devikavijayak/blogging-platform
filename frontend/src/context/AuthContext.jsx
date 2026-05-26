import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await axios.get('https://blogging-platform-h7ur.onrender.com/api/auth/me', { withCredentials: true });
            setUser(res.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const res = await axios.post('https://blogging-platform-h7ur.onrender.com/api/auth/login', { username, password }, { withCredentials: true });
        setUser(res.data.user);
    };

    const register = async (username, email, password) => {
        await axios.post('https://blogging-platform-h7ur.onrender.com/api/auth/register', { username, email, password });
    };

    const logout = async () => {
        await axios.post('https://blogging-platform-h7ur.onrender.com/api/auth/logout', {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
