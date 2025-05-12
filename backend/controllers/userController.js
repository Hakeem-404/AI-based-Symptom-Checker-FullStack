// controllers/userController.js
import db from '../config/database.js';
import bcrypt from 'bcryptjs'; 

export const addUserProfile = async (req, res) => {
    const { first_name, last_name, dob, gender, country, address, phone_number, userId } = req.body;
    
    if (!first_name || !last_name) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
        // Calculate age
        const age = dob ? Math.floor((new Date() - new Date(dob)) / 31557600000) : null;

        const [result] = await db.execute(
            'UPDATE users SET first_name = ?, last_name = ?, dob = ?, age = ?, gender = ?, country = ?, address = ?, phone_number = ? WHERE id = ?',
            [first_name, last_name, dob || null, age, gender || null, country || null, address || null, phone_number || null, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'User profile created successfully',
            userId: userId
        });

    } catch (error) {
        console.error('Error adding user profile:', error);
        res.status(500).json({ error: 'Failed to create user profile' });
    }
};

export const getUserProfile = async (req, res) => {
    if (!req.params.userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const [results] = await db.execute(
            'SELECT * FROM users WHERE id = ?', 
            [req.params.userId]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        delete user.password; // Remove sensitive data
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

export const updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const { first_name, last_name, dob, gender, country, address, phone_number } = req.body;

    try {
        // Calculate age if dob is provided
        const age = dob ? Math.floor((new Date() - new Date(dob)) / 31557600000) : null;

        const [result] = await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, dob = ?, age = ?, gender = ?, country = ?, address = ?, phone_number = ? WHERE id = ?',
            [first_name, last_name, dob, age, gender, country, address, phone_number, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
};

export const updatePassword = async (req, res) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            error: 'Both current password and new password are required' 
        });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get user's current password hash
        const [users] = await connection.execute(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            await connection.rollback();
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        await connection.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        await connection.commit();
        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    } finally {
        connection.release();
    }
};

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required for account deletion' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // First get the user's password hash
        const [users] = await connection.execute(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await connection.rollback();
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Delete related records first (foreign key constraints)
        await connection.execute('DELETE FROM health_metrics WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM medical_information WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM lifestyle_factors WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM health_metrics_history WHERE user_id = ?', [userId]);
        
        // Finally delete user
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        res.status(200).json({ message: 'Account deleted successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    } finally {
        connection.release();
    }
};