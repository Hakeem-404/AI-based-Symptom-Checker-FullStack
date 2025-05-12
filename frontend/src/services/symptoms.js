// src/services/symptoms.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const symptomsService = {
  async analyseSymptoms(userId, symptoms) {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/symptoms/analyse`, {
        userId,
        symptoms
      });
      return response;
    } catch (error) {
      console.error('Error analysing symptoms:', error);
      throw error;
    }
  },

  async getSymptomHistory(userId) {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/symptoms/history`);
      return response;
    } catch (error) {
      console.error('Error fetching symptom history:', error);
      throw error;
    }
  }
};