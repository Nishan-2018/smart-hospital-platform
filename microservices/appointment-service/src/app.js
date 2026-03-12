const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics');
const appointmentRoutes = require('./routes/appointmentRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Appointment Service API',
            version: '1.0.0',
            description: 'Smart Hospital Platform - Appointment Scheduling Service'
        },
        servers: [{ url: '/api/v1' }]
    },
    apis: ['./src/routes/*.js']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

app.use(errorHandler);

module.exports = app;
