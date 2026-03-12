const express = require('express');
const router = express.Router();
const { sequelize } = require('../db/connection');

router.get('/', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'healthy',
            service: 'appointment-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            service: 'appointment-service',
            database: 'disconnected',
            error: error.message
        });
    }
});

router.get('/ready', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'ready' });
    } catch (error) {
        res.status(503).json({ status: 'not ready' });
    }
});

router.get('/live', (req, res) => {
    res.json({ status: 'alive' });
});

module.exports = router;
