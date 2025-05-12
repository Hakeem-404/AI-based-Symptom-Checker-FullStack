// src/services/medical.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const medicalService = {
  async addMedicalInfo(userId, data) {
    try {
      const medicalData = {
        conditions: data.conditions,
        medications: data.medications,
        allergies: data.allergies,
        bloodType: data.bloodType,
        chest_pain_type: data.chest_pain_type,
        pregnancy: data.pregnancy,
        hypertension: data.hypertension,
        lifestyle: {
          smoking: data.lifestyle.smoking,
          alcoholConsumption: data.lifestyle.alcoholConsumption,
          exerciseFrequency: data.lifestyle.exerciseFrequency
        }
      };

      const response = await axios.post(`${API_URL}/users/${userId}/medical`, medicalData);
      return response.data;
    } catch (error) {
      console.error('Medical service error:', error);
      throw error;
    }
  },

  async updateMedicalInfo(userId, data) {
    try {
      console.log('Medical service sending data:', data); // Debug log
      const response = await axios.put(`${API_URL}/users/${userId}/medical`, data);
      console.log('Medical service response:', response); // Debug log
      return response;
    } catch (error) {
      console.error('Error updating medical info:', error);
      throw error;
    }
  },

  async getMedicalInfo(userId) {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/medical`);
      return response;
    } catch (error) {
      console.error('Error fetching medical info:', error);
      throw error;
    }
  }
};