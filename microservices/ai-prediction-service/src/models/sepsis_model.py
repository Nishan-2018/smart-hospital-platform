import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib
import os
import logging

logger = logging.getLogger(__name__)


class SepsisPredictor:
    """
    ML model for predicting sepsis risk in patients.
    
    Features used for prediction:
    - heart_rate: Heart rate (beats per minute)
    - respiratory_rate: Respiratory rate (breaths per minute)
    - temperature: Body temperature (°C)
    - wbc_count: White blood cell count (×10³/μL)
    - systolic_bp: Systolic blood pressure (mmHg)
    - diastolic_bp: Diastolic blood pressure (mmHg)
    - oxygen_saturation: Blood oxygen saturation (%)
    - age: Patient age (years)
    - lactate_level: Blood lactate level (mmol/L)
    - creatinine: Serum creatinine (mg/dL)
    """

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.getenv('MODEL_PATH', 'models/sepsis_model.pkl')
        self.scaler_path = os.getenv('SCALER_PATH', 'models/scaler.pkl')
        self.feature_names = [
            'heart_rate', 'respiratory_rate', 'temperature',
            'wbc_count', 'systolic_bp', 'diastolic_bp',
            'oxygen_saturation', 'age', 'lactate_level', 'creatinine'
        ]
        self.is_trained = False

    def generate_synthetic_data(self, n_samples=2000):
        """Generate synthetic patient data for training."""
        np.random.seed(42)

        # Normal patients (70%)
        n_normal = int(n_samples * 0.7)
        normal_data = {
            'heart_rate': np.random.normal(75, 10, n_normal),
            'respiratory_rate': np.random.normal(16, 3, n_normal),
            'temperature': np.random.normal(36.8, 0.4, n_normal),
            'wbc_count': np.random.normal(7.5, 2, n_normal),
            'systolic_bp': np.random.normal(120, 15, n_normal),
            'diastolic_bp': np.random.normal(80, 10, n_normal),
            'oxygen_saturation': np.random.normal(97, 1.5, n_normal),
            'age': np.random.normal(50, 18, n_normal),
            'lactate_level': np.random.normal(1.0, 0.3, n_normal),
            'creatinine': np.random.normal(1.0, 0.2, n_normal),
            'sepsis_risk': np.zeros(n_normal)
        }

        # Sepsis patients (30%)
        n_sepsis = n_samples - n_normal
        sepsis_data = {
            'heart_rate': np.random.normal(110, 20, n_sepsis),
            'respiratory_rate': np.random.normal(24, 5, n_sepsis),
            'temperature': np.random.normal(38.8, 1.0, n_sepsis),
            'wbc_count': np.random.normal(15, 5, n_sepsis),
            'systolic_bp': np.random.normal(90, 20, n_sepsis),
            'diastolic_bp': np.random.normal(60, 15, n_sepsis),
            'oxygen_saturation': np.random.normal(92, 3, n_sepsis),
            'age': np.random.normal(65, 15, n_sepsis),
            'lactate_level': np.random.normal(3.5, 1.5, n_sepsis),
            'creatinine': np.random.normal(2.0, 0.8, n_sepsis),
            'sepsis_risk': np.ones(n_sepsis)
        }

        # Combine data
        df_normal = pd.DataFrame(normal_data)
        df_sepsis = pd.DataFrame(sepsis_data)
        df = pd.concat([df_normal, df_sepsis], ignore_index=True)

        # Clip values to realistic ranges
        df['heart_rate'] = df['heart_rate'].clip(40, 200)
        df['respiratory_rate'] = df['respiratory_rate'].clip(8, 45)
        df['temperature'] = df['temperature'].clip(34, 42)
        df['wbc_count'] = df['wbc_count'].clip(1, 30)
        df['systolic_bp'] = df['systolic_bp'].clip(60, 200)
        df['diastolic_bp'] = df['diastolic_bp'].clip(30, 130)
        df['oxygen_saturation'] = df['oxygen_saturation'].clip(70, 100)
        df['age'] = df['age'].clip(18, 100).astype(int)
        df['lactate_level'] = df['lactate_level'].clip(0.5, 10)
        df['creatinine'] = df['creatinine'].clip(0.5, 5)

        return df.sample(frac=1).reset_index(drop=True)

    def train_model(self):
        """Train the sepsis prediction model."""
        logger.info('Training sepsis prediction model...')

        # Check if pre-trained model exists
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            try:
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_trained = True
                logger.info('Loaded pre-trained model')
                return
            except Exception as e:
                logger.warning(f'Failed to load pre-trained model: {e}')

        # Generate synthetic data
        df = self.generate_synthetic_data()

        X = df[self.feature_names].values
        y = df['sepsis_risk'].values

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train model
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        y_prob = self.model.predict_proba(X_test_scaled)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)

        logger.info(f'Model trained - Accuracy: {accuracy:.4f}, AUC-ROC: {auc:.4f}')
        logger.info(f'Classification Report:\n{classification_report(y_test, y_pred)}')

        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)

        self.is_trained = True
        logger.info('Model saved successfully')

    def predict(self, patient_data):
        """Predict sepsis risk for a patient."""
        if not self.is_trained:
            raise ValueError('Model is not trained yet')

        # Validate and extract features
        features = []
        for name in self.feature_names:
            if name not in patient_data:
                raise ValueError(f'Missing required feature: {name}')
            features.append(float(patient_data[name]))

        features_array = np.array(features).reshape(1, -1)
        features_scaled = self.scaler.transform(features_array)

        # Get prediction and probability
        prediction = self.model.predict(features_scaled)[0]
        probability = self.model.predict_proba(features_scaled)[0]

        # Determine risk level
        risk_score = probability[1]
        if risk_score < 0.3:
            risk_level = 'LOW'
            recommendation = 'Continue routine monitoring. No immediate intervention needed.'
        elif risk_score < 0.6:
            risk_level = 'MODERATE'
            recommendation = 'Increased monitoring recommended. Consider blood cultures and lactate levels.'
        elif risk_score < 0.8:
            risk_level = 'HIGH'
            recommendation = 'Urgent attention needed. Initiate sepsis bundle protocol. Blood cultures, antibiotics within 1 hour.'
        else:
            risk_level = 'CRITICAL'
            recommendation = 'IMMEDIATE intervention required. Activate rapid response team. Start aggressive fluid resuscitation and broad-spectrum antibiotics.'

        # Feature importance
        feature_importance = dict(zip(
            self.feature_names,
            self.model.feature_importances_.tolist()
        ))

        return {
            'sepsis_risk': bool(prediction),
            'risk_score': round(float(risk_score), 4),
            'risk_level': risk_level,
            'confidence': round(float(max(probability)), 4),
            'recommendation': recommendation,
            'feature_importance': feature_importance,
            'input_features': patient_data
        }

    def get_model_info(self):
        """Get model metadata."""
        return {
            'model_type': 'GradientBoostingClassifier',
            'features': self.feature_names,
            'is_trained': self.is_trained,
            'model_path': self.model_path,
            'n_estimators': 100,
            'version': '1.0.0'
        }
