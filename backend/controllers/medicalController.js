// controllers/medicalController.js
import db from '../config/database.js';

export const addMedicalInfo = async (req, res) => {
    const { userId } = req.params;
    const { 
        conditions = '', 
        medications = '', 
        allergies = '', 
        pregnancy = '',
        bloodType = '',
        chest_pain_type = '',
        hypertension = false
    } = req.body;
    
    const { 
        smoking = false, 
        alcoholConsumption = false, 
        exerciseFrequency = 'asymptomatic' 
    } = req.body.lifestyle || {};

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute(
            `INSERT INTO medical_information 
             (user_id, conditions, medications, allergies, pregnancy, hypertension, blood_type, chest_pain_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, conditions, medications, allergies, pregnancy, hypertension, bloodType, chest_pain_type]
        );

        await connection.execute(
            `INSERT INTO lifestyle_factors 
             (user_id, smoking, alcohol_consumption, exercise_frequency) 
             VALUES (?, ?, ?, ?)`,
            [userId, smoking, alcoholConsumption, exerciseFrequency]
        );

        await connection.commit();
        res.status(201).json({ message: 'Medical information added successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error adding medical information:', error);
        res.status(500).json({ error: 'Failed to add medical information' });
    } finally {
        connection.release();
    }
};

export const updateMedicalInfo = async (req, res) => {
    const { userId } = req.params;
    const { 
        conditions = null, 
        medications = null, 
        allergies = null, 
        pregnancy = null,
        bloodType = null,
        chest_pain_type = null,
        hypertension = false
    } = req.body.medical || {};
    
    const { 
        smoking = false, 
        alcoholConsumption = false, 
        exerciseFrequency = 'none' 
    } = req.body.lifestyle || {};

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute(
            `UPDATE medical_information 
             SET conditions = COALESCE(?, conditions), 
                 medications = COALESCE(?, medications), 
                 allergies = COALESCE(?, allergies), 
                 pregnancy = COALESCE(?, pregnancy),
                 blood_type = COALESCE(?, blood_type),
                 chest_pain_type = COALESCE(?, chest_pain_type),
                 hypertension = COALESCE(?, hypertension)
             WHERE user_id = ?`,
            [conditions, medications, allergies, pregnancy, bloodType, chest_pain_type, hypertension, userId]
        );

        await connection.execute(
            `UPDATE lifestyle_factors 
             SET smoking = ?, 
                 alcohol_consumption = ?, 
                 exercise_frequency = ? 
             WHERE user_id = ?`,
            [smoking, alcoholConsumption, exerciseFrequency, userId]
        );

        await connection.commit();
        res.status(200).json({ message: 'Medical information updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating medical information:', error);
        res.status(500).json({ error: 'Failed to update medical information' });
    } finally {
        connection.release();
    }
};

export const getMedicalInfo = async (req, res) => {
    const { userId } = req.params;

    try {
        const [medicalInfo] = await db.query(
            'SELECT * FROM medical_information WHERE user_id = ?',
            [userId]
        );

        const [lifestyleInfo] = await db.query(
            'SELECT * FROM lifestyle_factors WHERE user_id = ?',
            [userId]
        );

        if (medicalInfo.length === 0) {
            return res.status(404).json({ error: 'Medical information not found' });
        }

        res.status(200).json({
            medical: medicalInfo[0],
            lifestyle: lifestyleInfo[0]
        });
    } catch (error) {
        console.error('Error fetching medical information:', error);
        res.status(500).json({ error: 'Failed to fetch medical information' });
    }
};