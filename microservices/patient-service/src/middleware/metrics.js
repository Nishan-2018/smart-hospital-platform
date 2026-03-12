const client = require('prom-client');

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);

const metricsMiddleware = (req, res, next) => {
    if (req.path === '/metrics') return next();

    activeConnections.inc();
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
        const route = req.route ? req.route.path : req.path;
        const labels = {
            method: req.method,
            route: route,
            status_code: res.statusCode
        };
        end(labels);
        httpRequestTotal.inc(labels);
        activeConnections.dec();
    });

    next();
};

const metricsEndpoint = async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
};

module.exports = { metricsMiddleware, metricsEndpoint };
