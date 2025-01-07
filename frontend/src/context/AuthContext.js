import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [error, setError] = useState(null); // Optional error state for feedback

    useEffect(() => {
        // This effect checks the token on mount, for example, if it's expired
        const token = localStorage.getItem("token");
        if (token) {
            // You can validate the token here if needed (e.g., decode JWT)
            // For now, we'll assume the token is valid if it exists
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);  // Save token in localStorage
                setIsLoggedIn(true);  // Update context state
                setError(null);  // Clear any previous errors
            }
        } catch (error) {
            setError("Login failed. Please check your credentials.");
            throw new Error('Login failed');  // Log the error for debugging
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
