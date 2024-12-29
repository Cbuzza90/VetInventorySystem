import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        role: null,
        isAuthenticated: false,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setAuthState({
                    token,
                    role: decoded.role,
                    isAuthenticated: true,
                });
            } catch (err) {
                console.error('Invalid token:', err);
                localStorage.removeItem('token');
                setAuthState({ token: null, role: null, isAuthenticated: false });
            }
        }
    }, []);

    const login = (token) => {
        const decoded = jwtDecode(token);
        setAuthState({
            token,
            role: decoded.role,
            isAuthenticated: true,
        });
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setAuthState({
            token: null,
            role: null,
            isAuthenticated: false,
        });
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
