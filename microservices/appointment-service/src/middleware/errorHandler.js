const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
};

module.exports = errorHandler;
