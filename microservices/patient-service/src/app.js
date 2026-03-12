const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics');
const patientRoutes = require('./routes/patientRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Metrics
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

// Swagger API documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Patient Service API',
            version: '1.0.0',
            description: 'Smart Hospital Platform - Patient Management Service',
            contact: {
                name: 'HCA DevOps Team',
                email: 'devops@smarthospital.com'
            }
        },
        servers: [
            { url: '/api/v1', description: 'API v1' }
        ]
    },
    apis: ['./src/routes/*.js']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/patients', patientRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
