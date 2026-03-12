const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter (configurable for different environments)
const createTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    // Development: Use Ethereal (fake SMTP for testing)
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.ETHEREAL_USER || 'dev@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'devpassword'
        }
    });
};

async function sendEmailNotification({ to, subject, body, appointmentId }) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Smart Hospital" <notifications@smarthospital.com>',
            to,
            subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0066cc, #004d99); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🏥 Smart Hospital</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">${subject}</h2>
            <p style="color: #555; line-height: 1.6;">${body}</p>
            ${appointmentId ? `<p style="color: #888; font-size: 12px;">Appointment ID: ${appointmentId}</p>` : ''}
          </div>
          <div style="background: #333; padding: 15px; text-align: center;">
            <p style="color: #aaa; margin: 0; font-size: 12px;">
              Smart Hospital Platform &copy; ${new Date().getFullYear()}
            </p>
          </div>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`, { to, subject, appointmentId });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Failed to send email:', { error: error.message, to, appointmentId });
        return { success: false, error: error.message };
    }
}

module.exports = { sendEmailNotification };
