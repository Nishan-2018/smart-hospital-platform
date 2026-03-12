require('dotenv').config();
const app = require('./app');
const { startConsumer } = require('./consumers/appointmentConsumer');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3003;

async function startServer() {
    try {
        // Start RabbitMQ consumer
        try {
            await startConsumer();
            logger.info('RabbitMQ consumer started successfully');
        } catch (mqError) {
            logger.warn('RabbitMQ consumer failed to start:', mqError.message);
        }

        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`Notification Service running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down...');
    process.exit(0);
});

startServer();
