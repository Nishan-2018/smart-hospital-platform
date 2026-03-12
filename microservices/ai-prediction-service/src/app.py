import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from prometheus_client import make_wsgi_app
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from dotenv import load_dotenv

from routes.prediction_routes import prediction_bp
from routes.health_routes import health_bp
from models.sepsis_model import SepsisPredictor

load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s [ai-prediction-service] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'

    # CORS
    CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ORIGIN', '*')}})

    # Initialize the ML model
    try:
        predictor = SepsisPredictor()
        predictor.train_model()
        app.config['PREDICTOR'] = predictor
        logger.info('ML model trained and ready')
    except Exception as e:
        logger.error(f'Failed to initialize ML model: {e}')
        app.config['PREDICTOR'] = None

    # Register blueprints
    app.register_blueprint(health_bp, url_prefix='/api/v1/health')
    app.register_blueprint(prediction_bp, url_prefix='/api/v1/predict')

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

    # Add Prometheus metrics endpoint
    app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
        '/metrics': make_wsgi_app()
    })

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 3004))
    logger.info(f'AI Prediction Service starting on port {port}')
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
