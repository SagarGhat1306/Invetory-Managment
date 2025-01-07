import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Moved to the top

const API_URL = 'http://localhost:5000/api/auth';

// Login function with a passed callback for login
export const login = async (email, password, loginCallback) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });

  if (response.data.token) {
    loginCallback(response.data.token); // Call the login function passed as an argument
  }

  return response.data;
};

// Register function
export const register = async (ownerName, storeName, email, password) => {
  const response = await axios.post(`${API_URL}/register`, { ownerName, storeName, email, password });
  return response.data;
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
};
