// controllers/authController.js
import db from '../config/database.js';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [users] = await db.execute(
            'SELECT id, email, password FROM users WHERE email = ? LIMIT 1', 
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ 
            message: 'Login successful', 
            user: { id: user.id, email: user.email } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const register = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const connection = await db.getConnection();

    try {
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.beginTransaction();

        try {
            const [result] = await connection.execute(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword]
            );

            await connection.commit();

            res.status(201).json({ 
                message: 'Registration successful',
                user: {
                    id: result.insertId,
                    email: email
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    } finally {
        connection.release();
    }
};

export const forgotPassword = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and new password are required' });
    }

    const connection = await db.getConnection();

    try {
        // Check if the user exists
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the password
        await connection.beginTransaction();

        try {
            await connection.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                [hashedPassword, email]
            );

            await connection.commit();

            res.status(200).json({ 
                message: 'Password updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    } finally {
        connection.release();
    }
};