import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set default axios header
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        // Initialize session
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                const token = session.access_token;
                const userData = localStorage.getItem('user');

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                if (userData) {
                    setUser(JSON.parse(userData));
                } else {
                    // If no local user data but there is a session, try to fetch from public.users via backend
                    try {
                        const res = await axios.get('/api/auth/me'); // We might need this endpoint
                        setUser(res.data.user);
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                    } catch (err) {
                        console.error('Failed to fetch user profile:', err);
                    }
                }
            }
            setLoading(false);
        };

        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                const token = session.access_token;
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
            }
        });

        // Interceptor for 401/403 (e.g. banned users)
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    if (error.response.data.message?.toLowerCase().includes('ban') ||
                        error.response.data.message?.toLowerCase().includes('restricted')) {

                        supabase.auth.signOut();
                        if (window.location.pathname !== '/banned') {
                            window.location.href = '/banned';
                        }
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            subscription.unsubscribe();
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            const token = data.session.access_token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Fetch profile including role from backend
            const res = await axios.get('/api/auth/me');
            const userData = res.data.user;

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (err) {
            return { success: false, message: err.message || 'Login failed' };
        }
    };

    const register = async (username, email, password, role) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        role
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                const token = data.session.access_token;
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch profile including role from backend (the trigger in DB should have created the record)
                const res = await axios.get('/api/auth/me');
                const userData = res.data.user;

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            } else {
                return { success: true, message: 'Signup successful! Please check your email for confirmation.' };
            }
        } catch (err) {
            return { success: false, message: err.message || 'Register failed' };
        }
    };

    const impersonate = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, impersonate, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
