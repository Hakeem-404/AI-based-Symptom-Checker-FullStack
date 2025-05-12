// controllers/healthHistoryController.js
import db from '../config/database.js';

export const getHealthHistory = async (req, res) => {
    const { userId } = req.params;
    const { period } = req.query;

    try {
        let timeFilter = '';
        switch(period) {
            case 'week':
                timeFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
                break;
            case 'month':
                timeFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
                break;
            case 'year':
                timeFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
                break;
            default:
                timeFilter = '';
        }

        const [results] = await db.execute(
            `SELECT * FROM health_metrics_history 
             WHERE user_id = ? ${timeFilter} 
             ORDER BY recorded_at DESC`,
            [userId]
        );

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching health history:', error);
        res.status(500).json({ error: 'Failed to fetch health history' });
    }
};