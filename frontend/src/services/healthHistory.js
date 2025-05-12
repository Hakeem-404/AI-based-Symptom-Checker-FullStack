// src/services/healthHistory.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const healthHistoryService = {
  async getHistory(userId, period = '') {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/history?period=${period}`);
      console.log('History Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }
};