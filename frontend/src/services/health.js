// src/services/health.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const healthService = {
  async addHealthMetrics(userId, data) {
    try {
      const metricsData = {
        height: Number(data.height),
        weight: Number(data.weight),
        bmi: Number(data.bmi),
        blood_pressure: data.blood_pressure,
        heart_rate: Number(data.heart_rate),
        max_heart_rate: Number(data.max_heart_rate),
        skin_thickness: Number(data.skin_thickness),
        glucose: Number(data.glucose),
        cholesterol: Number(data.cholesterol)
      };

      const response = await axios.post(`${API_URL}/users/${userId}/health`, metricsData);
      return response.data;
    } catch (error) {
      console.error('Health service error:', error);
      throw error;
    }
  },
  
  async updateHealthMetrics(userId, data)  {
    try {
      console.log('Sending health metrics to server:', data);
      const response = await axios.put(`${API_URL}/users/${userId}/health`, data);
      console.log('Server response:', response.data);
      return response;
    } catch (error) {
      console.error('Error updating health metrics:', error);
      throw error;
    }
  },

  async getHealthMetrics(userId) {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/health`);
      
      // Log the response to see what we're getting
      console.log('Health metrics response:', response.data);
      
      // Make sure we're returning the data in the expected format
      return {
        data: response.data
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Return empty data structure if no metrics exist yet
        return { data: {} };
      }
      console.error('Health service error:', error);
      throw error;
    }
  }
};