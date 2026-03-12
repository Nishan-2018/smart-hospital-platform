const amqp = require('amqplib');
const logger = require('../utils/logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'hospital_events';
const APPOINTMENT_QUEUE = 'appointment_notifications';

async function connectRabbitMQ() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    // Setup exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Setup queue
    await channel.assertQueue(APPOINTMENT_QUEUE, {
        durable: true,
        arguments: {
            'x-message-ttl': 86400000, // 24 hours
            'x-dead-letter-exchange': `${EXCHANGE_NAME}.dlx`
        }
    });

    // Bind queue to exchange
    await channel.bindQueue(APPOINTMENT_QUEUE, EXCHANGE_NAME, 'appointment.*');

    logger.info('RabbitMQ connection and channel established');

    connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
    });

    return { connection, channel };
}

async function publishEvent(routingKey, message) {
    if (!channel) {
        logger.warn('RabbitMQ channel not available, skipping event publish');
        return false;
    }

    try {
        const messageBuffer = Buffer.from(JSON.stringify({
            ...message,
            timestamp: new Date().toISOString(),
            source: 'appointment-service'
        }));

        channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
            persistent: true,
            contentType: 'application/json'
        });

        logger.info(`Published event: ${routingKey}`, { messageId: message.id });
        return true;
    } catch (error) {
        logger.error('Failed to publish event:', error);
        return false;
    }
}

async function closeConnection() {
    if (channel) await channel.close();
    if (connection) await connection.close();
}

module.exports = { connectRabbitMQ, publishEvent, closeConnection };
