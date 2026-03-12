const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    if (err.name === 'SequelizeDatabaseError') {
        return res.status(500).json({
            success: false,
            error: 'Database error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
};

module.exports = errorHandler;
