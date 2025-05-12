//controllers/healthController.js
import db from '../config/database.js';

export const addHealthMetrics = async (req, res) => {
    const { userId } = req.params;
    const { 
        height, weight, bmi, blood_pressure, heart_rate,
        max_heart_rate, skin_thickness, glucose, cholesterol
    } = req.body;

    try {
        const [existingMetrics] = await db.query(
            'SELECT * FROM health_metrics WHERE user_id = ?',
            [userId]
        );

        if (existingMetrics.length > 0) {
            await db.query(
                `UPDATE health_metrics 
                 SET height = ?, weight = ?, bmi = ?, blood_pressure = ?, 
                     heart_rate = ?, max_heart_rate = ?, skin_thickness = ?,
                     glucose = ?, cholesterol =?
                 WHERE user_id = ?`,
                [height, weight, bmi, blood_pressure, heart_rate,
                 max_heart_rate, skin_thickness, glucose, cholesterol, userId]
            );
        } else {
            await db.query(
                `INSERT INTO health_metrics 
                 (user_id, height, weight, bmi, blood_pressure, heart_rate,
                  max_heart_rate, skin_thickness, glucose, cholesterol)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, height, weight, bmi, blood_pressure, heart_rate,
                 max_heart_rate, skin_thickness, glucose, cholesterol]
            );
        }

        // Add to history
        await db.query(
            `INSERT INTO health_metrics_history 
             (user_id, height, weight, bmi, blood_pressure, heart_rate,
              max_heart_rate, skin_thickness, glucose, cholesterol)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, height, weight, bmi, blood_pressure, heart_rate,
             max_heart_rate, skin_thickness, glucose, cholesterol]
        );

        res.status(200).json({ message: 'Health metrics updated successfully' });
    } catch (error) {
        console.error('Error adding/updating health metrics:', error);
        res.status(500).json({ error: 'Failed to add/update health metrics' });
    }
};

export const getHealthMetrics = async (req, res) => {
    const { userId } = req.params;

    try {
        const [results] = await db.query(
            'SELECT * FROM health_metrics WHERE user_id = ?',
            [userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: 'No health metrics found for this user' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching health metrics:', error);
        res.status(500).json({ error: 'Failed to fetch health metrics' });
    }
};

export const updateHealthMetrics = async (req, res) => {
    const { userId } = req.params;
    const { 
        height, weight, bmi, blood_pressure, heart_rate,
        max_heart_rate, skin_thickness, glucose, cholesterol
    } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE health_metrics 
             SET height = ?, weight = ?, bmi = ?, blood_pressure = ?, 
                 heart_rate = ?, max_heart_rate = ?, skin_thickness = ?,
                 glucose = ?, cholesterol =?
             WHERE user_id = ?`,
            [height || null, weight || null, bmi || null, blood_pressure || null, 
             heart_rate || null, max_heart_rate || null, skin_thickness || null, 
             glucose || null, cholesterol || null, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No health metrics found for this user' });
        }

        // Add to history after successful update
        await db.query(
            `INSERT INTO health_metrics_history 
             (user_id, height, weight, bmi, blood_pressure, heart_rate,
              max_heart_rate, skin_thickness, glucose, cholesterol)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, height, weight, bmi, blood_pressure, heart_rate,
             max_heart_rate, skin_thickness, glucose, cholesterol]
        );

        res.status(200).json({ 
            message: 'Health metrics updated successfully',
            data: {
                height, weight, bmi, blood_pressure, heart_rate,
                max_heart_rate, skin_thickness, glucose, cholesterol
            }
        });
    } catch (error) {
        console.error('Error updating health metrics:', error);
        res.status(500).json({ error: 'Failed to update health metrics' });
    }
};