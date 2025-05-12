// src/services/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const authService = {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', response.data.user.id);
    }
    return response.data;
  },

  async register(email, password) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password
    });
    
    //login after registration
    // if (response.data.user) {
    //   localStorage.setItem('userId', response.data.user.id);
    //   localStorage.setItem('user', JSON.stringify(response.data.user));
    // }
    
    return response.data;
  },

  async forgotPassword(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/forgotpassword`, { 
        email, 
        password 
      });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error.response.data);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user');
  }
};