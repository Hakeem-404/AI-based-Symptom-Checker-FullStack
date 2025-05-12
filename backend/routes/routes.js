import express from 'express';
import { register, login, forgotPassword } from '../controllers/authController.js';
import { addUserProfile, getUserProfile, updateUserProfile, updatePassword, deleteUser } from '../controllers/userController.js';
import { addHealthMetrics, getHealthMetrics, updateHealthMetrics } from '../controllers/healthController.js';
import { addMedicalInfo, updateMedicalInfo, getMedicalInfo } from '../controllers/medicalController.js';
import { getHealthHistory } from '../controllers/healthHistoryController.js';
import { analyseSymptoms, getSymptomHistory } from '../controllers/symptomsController.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgotpassword', forgotPassword);

// User routes
router.post('/users/:userId/profile', addUserProfile);
router.get('/users/:userId/profile', getUserProfile);
router.put('/users/:userId/profile', updateUserProfile);
router.put('/users/:userId/password', updatePassword);
router.delete('/users/:userId', deleteUser);

// Health metrics routes
router.post('/users/:userId/health', addHealthMetrics);
router.get('/users/:userId/health', getHealthMetrics);
router.put('/users/:userId/health', updateHealthMetrics);

// Medical routes
router.post('/users/:userId/medical', addMedicalInfo);
router.put('/users/:userId/medical', updateMedicalInfo);
router.get('/users/:userId/medical', getMedicalInfo);

// History routes
router.get('/users/:userId/history', getHealthHistory);

// Symptom checker routes
router.post('/users/:userId/symptoms/analyse', analyseSymptoms);
router.get('/users/:userId/symptoms/history', getSymptomHistory);

export default router;