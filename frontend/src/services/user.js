// src/services/user.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const userService = {
  async addUserProfile(userId, data) {
    return axios.post(`${API_URL}/users/${userId}/profile`, {
      ...data,
      userId
    });
  },

  async updateUserProfile(userId, data) {
    console.log('Updating user profile:', { userId, data });
    return axios.put(`${API_URL}/users/${userId}/profile`, data);
  },

  async getUserProfile(userId) {
    return axios.get(`${API_URL}/users/${userId}/profile`);
  },

  async updatePassword(userId, { currentPassword, newPassword }) {
    console.log('Updating password for user:', userId);
    return axios.put(`${API_URL}/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
  },

  async deleteAccount(userId, password) {
    try {
        const response = await axios.delete(`${API_URL}/users/${userId}`, {
            data: { password }  // Send password in request body
        });
        return response.data;
    } catch (error) {
        console.error('Delete account error:', error.response?.data);
        throw error;
    }
  }
};