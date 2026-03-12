const amqp = require('amqplib');
const { sendEmailNotification } = require('../services/emailService');
const { sendSMSNotification } = require('../services/smsService');
const logger = require('../utils/logger');

const EXCHANGE_NAME = 'hospital_events';
const QUEUE_NAME = 'appointment_notifications';

async function startConsumer() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
        arguments: {
            'x-message-ttl': 86400000,
            'x-dead-letter-exchange': `${EXCHANGE_NAME}.dlx`
        }
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'appointment.*');

    // Prefetch 1 message at a time for fair dispatch
    channel.prefetch(1);

    logger.info('Waiting for appointment events...');

    channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;

        try {
            const event = JSON.parse(msg.content.toString());
            const routingKey = msg.fields.routingKey;

            logger.info(`Received event: ${routingKey}`, { eventId: event.id });

            await processEvent(routingKey, event);

            channel.ack(msg);
            logger.info(`Event processed successfully: ${routingKey}`);
        } catch (error) {
            logger.error('Error processing message:', error);
            // Reject and requeue if processing fails
            channel.nack(msg, false, true);
        }
    });

    connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
    });

    return { connection, channel };
}

async function processEvent(routingKey, event) {
    let subject, message;

    switch (routingKey) {
        case 'appointment.created':
            subject = 'New Appointment Scheduled';
            message = `Your appointment with Dr. ${event.doctorName} has been scheduled for ${new Date(event.appointmentDate).toLocaleString()}. Appointment type: ${event.type || 'consultation'}.`;
            break;

        case 'appointment.updated':
            subject = 'Appointment Updated';
            message = `Your appointment with Dr. ${event.doctorName} has been updated. Status changed from ${event.previousStatus} to ${event.newStatus}.`;
            break;

        case 'appointment.cancelled':
            subject = 'Appointment Cancelled';
            message = `Your appointment with Dr. ${event.doctorName} on ${new Date(event.appointmentDate).toLocaleString()} has been cancelled.`;
            break;

        case 'appointment.status_changed':
            subject = 'Appointment Status Update';
            message = `Your appointment status has changed from ${event.previousStatus} to ${event.newStatus}.`;
            break;

        default:
            logger.warn(`Unknown event type: ${routingKey}`);
            return;
    }

    // Send notifications
    const notificationPromises = [];

    if (process.env.EMAIL_ENABLED === 'true') {
        notificationPromises.push(
            sendEmailNotification({
                to: event.patientEmail || process.env.DEFAULT_NOTIFICATION_EMAIL,
                subject: `[Smart Hospital] ${subject}`,
                body: message,
                appointmentId: event.id
            })
        );
    }

    if (process.env.SMS_ENABLED === 'true') {
        notificationPromises.push(
            sendSMSNotification({
                to: event.patientPhone || process.env.DEFAULT_NOTIFICATION_PHONE,
                message: `Smart Hospital: ${message}`,
                appointmentId: event.id
            })
        );
    }

    if (notificationPromises.length === 0) {
        logger.info('No notification channels enabled, logging event only:', { subject, message });
    }

    await Promise.allSettled(notificationPromises);
}

module.exports = { startConsumer };
