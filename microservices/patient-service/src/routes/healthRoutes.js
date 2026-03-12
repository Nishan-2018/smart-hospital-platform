const express = require('express');
const router = express.Router();
const { sequelize } = require('../db/connection');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'healthy',
            service: 'patient-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
            version: process.env.APP_VERSION || '1.0.0'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            service: 'patient-service',
            timestamp: new Date().toISOString(),
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
        res.status(503).json({ status: 'not ready', error: error.message });
    }
});

router.get('/live', (req, res) => {
    res.json({ status: 'alive' });
});

module.exports = router;
