const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// In-memory notification log (in production, use a database)
const notificationLog = [];

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notification history
 *     tags: [Notifications]
 */
router.get('/', (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const paginatedLog = notificationLog.slice(offset, offset + parseInt(limit));

    res.json({
        success: true,
        data: paginatedLog,
        pagination: {
            total: notificationLog.length,
            page: parseInt(page),
            limit: parseInt(limit)
        }
    });
});

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Manually send a notification
 *     tags: [Notifications]
 */
router.post('/send', async (req, res) => {
    try {
        const { type, recipient, subject, message } = req.body;

        if (!type || !recipient || !message) {
            return res.status(400).json({
                success: false,
                error: 'type, recipient, and message are required'
            });
        }

        const notification = {
            id: Date.now().toString(),
            type,
            recipient,
            subject,
            message,
            status: 'sent',
            timestamp: new Date().toISOString()
        };

        notificationLog.push(notification);
        logger.info('Manual notification sent:', notification);

        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification sent successfully'
        });
    } catch (error) {
        logger.error('Failed to send notification:', error);
        res.status(500).json({ success: false, error: 'Failed to send notification' });
    }
});

/**
 * @swagger
 * /notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     tags: [Notifications]
 */
router.get('/stats', (req, res) => {
    const stats = {
        total: notificationLog.length,
        byType: {},
        byStatus: {},
        last24Hours: 0
    };

    const oneDayAgo = new Date(Date.now() - 86400000);

    notificationLog.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        stats.byStatus[n.status] = (stats.byStatus[n.status] || 0) + 1;
        if (new Date(n.timestamp) > oneDayAgo) stats.last24Hours++;
    });

    res.json({ success: true, data: stats });
});

module.exports = router;
