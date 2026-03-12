from flask import Blueprint, request, jsonify, current_app
from marshmallow import Schema, fields, validate, ValidationError
import logging

logger = logging.getLogger(__name__)

prediction_bp = Blueprint('prediction', __name__)


class PredictionSchema(Schema):
    """Validation schema for prediction input."""
    heart_rate = fields.Float(required=True, validate=validate.Range(min=40, max=200))
    respiratory_rate = fields.Float(required=True, validate=validate.Range(min=8, max=45))
    temperature = fields.Float(required=True, validate=validate.Range(min=34, max=42))
    wbc_count = fields.Float(required=True, validate=validate.Range(min=1, max=30))
    systolic_bp = fields.Float(required=True, validate=validate.Range(min=60, max=200))
    diastolic_bp = fields.Float(required=True, validate=validate.Range(min=30, max=130))
    oxygen_saturation = fields.Float(required=True, validate=validate.Range(min=70, max=100))
    age = fields.Integer(required=True, validate=validate.Range(min=18, max=100))
    lactate_level = fields.Float(required=True, validate=validate.Range(min=0.5, max=10))
    creatinine = fields.Float(required=True, validate=validate.Range(min=0.5, max=5))


prediction_schema = PredictionSchema()


@prediction_bp.route('/sepsis', methods=['POST'])
def predict_sepsis():
    """
    Predict sepsis risk for a patient.
    
    Expected JSON body:
    {
        "heart_rate": 110,
        "respiratory_rate": 22,
        "temperature": 38.5,
        "wbc_count": 14,
        "systolic_bp": 90,
        "diastolic_bp": 60,
        "oxygen_saturation": 93,
        "age": 65,
        "lactate_level": 3.2,
        "creatinine": 1.8
    }
    """
    try:
        # Validate input
        data = prediction_schema.load(request.get_json())

        predictor = current_app.config.get('PREDICTOR')
        if not predictor:
            return jsonify({
                'success': False,
                'error': 'ML model is not available'
            }), 503

        # Make prediction
        result = predictor.predict(data)

        logger.info(f'Prediction made - Risk: {result["risk_level"]}, Score: {result["risk_score"]}')

        return jsonify({
            'success': True,
            'data': result
        })

    except ValidationError as err:
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'details': err.messages
        }), 400

    except Exception as e:
        logger.error(f'Prediction error: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@prediction_bp.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the ML model."""
    predictor = current_app.config.get('PREDICTOR')
    if not predictor:
        return jsonify({
            'success': False,
            'error': 'ML model is not available'
        }), 503

    return jsonify({
        'success': True,
        'data': predictor.get_model_info()
    })


@prediction_bp.route('/sample', methods=['GET'])
def get_sample_input():
    """Get sample input for testing the prediction API."""
    return jsonify({
        'success': True,
        'data': {
            'normal_patient': {
                'heart_rate': 72,
                'respiratory_rate': 16,
                'temperature': 36.8,
                'wbc_count': 7.5,
                'systolic_bp': 120,
                'diastolic_bp': 80,
                'oxygen_saturation': 98,
                'age': 45,
                'lactate_level': 1.0,
                'creatinine': 1.0
            },
            'high_risk_patient': {
                'heart_rate': 115,
                'respiratory_rate': 28,
                'temperature': 39.2,
                'wbc_count': 18,
                'systolic_bp': 85,
                'diastolic_bp': 50,
                'oxygen_saturation': 90,
                'age': 70,
                'lactate_level': 4.5,
                'creatinine': 2.5
            }
        }
    })
