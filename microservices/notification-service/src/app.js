const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const notificationRoutes = require('./routes/notificationRoutes');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'notification-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/v1/health/live', (req, res) => {
    res.json({ status: 'alive' });
});

app.get('/api/v1/health/ready', (req, res) => {
    res.json({ status: 'ready' });
});

app.use('/api/v1/notifications', notificationRoutes);

app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = app;
