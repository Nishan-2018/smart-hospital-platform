from flask import Blueprint, jsonify
import logging

logger = logging.getLogger(__name__)

health_bp = Blueprint('health', __name__)


@health_bp.route('/', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'ai-prediction-service',
        'version': '1.0.0'
    })


@health_bp.route('/live', methods=['GET'])
def liveness():
    """Liveness probe for Kubernetes."""
    return jsonify({'status': 'alive'})


@health_bp.route('/ready', methods=['GET'])
def readiness():
    """Readiness probe for Kubernetes."""
    from flask import current_app
    predictor = current_app.config.get('PREDICTOR')

    if predictor and predictor.is_trained:
        return jsonify({'status': 'ready', 'model_loaded': True})
    else:
        return jsonify({'status': 'not ready', 'model_loaded': False}), 503
