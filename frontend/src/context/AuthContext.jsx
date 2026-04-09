import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, []);

    const checkAuth = async () => {
        try {
            // Updated to use the correct profile endpoint based on common patterns
            const res = await api.get('/auth/me');
            if (res.data.user) {
                const user = res.data.user;
                const normalizedUser = { ...user, id: user.id || user._id, _id: user._id || user.id };
                setUser(normalizedUser);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        const normalizedUser = { ...user, id: user.id || user._id, _id: user._id || user.id };
        console.log('Login successful, setting user:', normalizedUser);
        localStorage.setItem('token', token);
        setUser(normalizedUser);
        return normalizedUser;
    };

    const register = async (userData) => {
        const route = userData.adminKey ? '/auth/register-admin' : '/auth/register';
        const res = await api.post(route, userData);
        const { token, user } = res.data;
        const normalizedUser = { ...user, id: user.id || user._id, _id: user._id || user.id };
        localStorage.setItem('token', token);
        setUser(normalizedUser);
        return normalizedUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
