import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('', routes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});