require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./db/connection');
const { connectRabbitMQ } = require('./messaging/rabbitmq');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3002;

async function startServer() {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');

        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        logger.info('Database models synchronized');

        // Connect to RabbitMQ
        try {
            await connectRabbitMQ();
            logger.info('RabbitMQ connection established');
        } catch (mqError) {
            logger.warn('RabbitMQ connection failed, running without messaging:', mqError.message);
        }

        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`Appointment Service running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

startServer();
