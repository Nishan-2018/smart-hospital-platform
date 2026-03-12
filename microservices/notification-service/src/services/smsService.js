const logger = require('../utils/logger');

// SMS service stub - In production, integrate with Twilio, AWS SNS, or Azure Communication Services
async function sendSMSNotification({ to, message, appointmentId }) {
    try {
        if (process.env.SMS_PROVIDER === 'twilio') {
            // Twilio integration placeholder
            // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
            // const result = await client.messages.create({
            //   body: message,
            //   from: process.env.TWILIO_PHONE_NUMBER,
            //   to: to
            // });
            logger.info('SMS would be sent via Twilio:', { to, appointmentId });
        } else {
            // Log-only mode for development
            logger.info('SMS notification (dev mode):', {
                to,
                message,
                appointmentId,
                timestamp: new Date().toISOString()
            });
        }

        return { success: true, provider: process.env.SMS_PROVIDER || 'console' };
    } catch (error) {
        logger.error('Failed to send SMS:', { error: error.message, to, appointmentId });
        return { success: false, error: error.message };
    }
}

module.exports = { sendSMSNotification };
