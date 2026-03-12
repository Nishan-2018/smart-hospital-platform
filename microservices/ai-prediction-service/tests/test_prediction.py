import pytest
import json
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestHealthEndpoints:
    def test_health_check(self, client):
        response = client.get('/api/v1/health/')
        data = json.loads(response.data)
        assert response.status_code == 200
        assert data['status'] == 'healthy'
        assert data['service'] == 'ai-prediction-service'

    def test_liveness(self, client):
        response = client.get('/api/v1/health/live')
        data = json.loads(response.data)
        assert response.status_code == 200
        assert data['status'] == 'alive'


class TestPredictionEndpoints:
    def test_predict_normal_patient(self, client):
        payload = {
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
        }
        response = client.post('/api/v1/predict/sepsis',
                               data=json.dumps(payload),
                               content_type='application/json')
        data = json.loads(response.data)
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['risk_level'] == 'LOW'
        assert data['data']['risk_score'] < 0.3

    def test_predict_high_risk_patient(self, client):
        payload = {
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
        response = client.post('/api/v1/predict/sepsis',
                               data=json.dumps(payload),
                               content_type='application/json')
        data = json.loads(response.data)
        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['risk_level'] in ['HIGH', 'CRITICAL']

    def test_predict_missing_fields(self, client):
        payload = {'heart_rate': 72}
        response = client.post('/api/v1/predict/sepsis',
                               data=json.dumps(payload),
                               content_type='application/json')
        assert response.status_code == 400

    def test_predict_invalid_values(self, client):
        payload = {
            'heart_rate': 300,  # Out of range
            'respiratory_rate': 16,
            'temperature': 36.8,
            'wbc_count': 7.5,
            'systolic_bp': 120,
            'diastolic_bp': 80,
            'oxygen_saturation': 98,
            'age': 45,
            'lactate_level': 1.0,
            'creatinine': 1.0
        }
        response = client.post('/api/v1/predict/sepsis',
                               data=json.dumps(payload),
                               content_type='application/json')
        assert response.status_code == 400

    def test_get_sample_input(self, client):
        response = client.get('/api/v1/predict/sample')
        data = json.loads(response.data)
        assert response.status_code == 200
        assert 'normal_patient' in data['data']
        assert 'high_risk_patient' in data['data']

    def test_get_model_info(self, client):
        response = client.get('/api/v1/predict/model-info')
        data = json.loads(response.data)
        assert response.status_code == 200
        assert data['data']['model_type'] == 'GradientBoostingClassifier'
