// src/store/registration.js
import { reactive } from 'vue'

export const registrationStore = reactive({
  personalInfo: {
    firstName: '',
    lastName: '',
    dob: '',
    age: '',  // Added age field
    gender: '',
    phone: '',
    address: '',
    country: ''
  },
  healthMetrics: {
    height: '',
    weight: '',
    bmi: '',
    blood_pressure: '',
    pregnancy: '',
    heart_rate: '',
    max_heart_rate: '',
    skin_thickness: '',
    glucose: '',
    cholesterol: ''
  },
  medicalInfo: {
    conditions: '',
    medications: '',
    allergies: '',
    bloodType: '',
    chest_pain_type: '',
    hypertension: false,
    lifestyle: {
      smoking: false,
      alcoholConsumption: false,
      exerciseFrequency: ''
    }
  },
  currentStep: 1,

  setPersonalInfo(data) {
    this.personalInfo = { 
      ...this.personalInfo, ...data
    }
    this.currentStep = 2
  },

  setHealthMetrics(data) {
    this.healthMetrics = { ...this.healthMetrics, ...data }
    this.currentStep = 3
  },

  setMedicalInfo(data) {
    this.medicalInfo = { ...this.medicalInfo, ...data }
  },

  resetStore() {
    this.personalInfo = {
      firstName: '',
      lastName: '',
      dob: '',
      age: '',  // Reset age field
      gender: '',
      phone: '',
      address: '',
      country: ''
    }
    this.healthMetrics = {
      height: '',
      weight: '',
      bmi: '',
      blood_pressure: '',
      heart_rate: '',
      max_heart_rate: '',
      skin_thickness: '',
      glucose: '',
      cholesterol: ''
    }
    this.medicalInfo = {
      conditions: '',
      medications: '',
      allergies: '',
      pregnancy:'',
      bloodType: '',
      chest_pain_type: '',
      hypertension: false,
      lifestyle: {
        smoking: false,
        alcoholConsumption: false,
        exerciseFrequency: ''
      }
    }
    this.currentStep = 1
  }
})