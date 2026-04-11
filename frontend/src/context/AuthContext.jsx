import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/* eslint-disable react-refresh/only-export-components -- useAuth is intentionally co-located with AuthProvider */
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

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.user) {
                const userData = res.data.user;
                const normalizedUser = { ...userData, id: userData.id || userData._id, _id: userData._id || userData.id };
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
    }, [logout]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, [checkAuth]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: loginUser } = res.data;
        const normalizedUser = { ...loginUser, id: loginUser.id || loginUser._id, _id: loginUser._id || loginUser.id };
        console.log('Login successful, setting user:', normalizedUser);
        localStorage.setItem('token', token);
        setUser(normalizedUser);
        return normalizedUser;
    };

    const register = async (userData) => {
        const route = userData.adminKey ? '/auth/register-admin' : '/auth/register';
        const res = await api.post(route, userData);
        const { token, user: regUser } = res.data;
        const normalizedUser = { ...regUser, id: regUser.id || regUser._id, _id: regUser._id || regUser.id };
        localStorage.setItem('token', token);
        setUser(normalizedUser);
        return normalizedUser;
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

export default AuthContext;
