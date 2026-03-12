const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

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

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);

const metricsMiddleware = (req, res, next) => {
    if (req.path === '/metrics') return next();

    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
        const labels = {
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        };
        end(labels);
        httpRequestTotal.inc(labels);
    });
    next();
};

const metricsEndpoint = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

module.exports = { metricsMiddleware, metricsEndpoint };
