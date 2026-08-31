import os
import json
import joblib
import pandas as pd
import numpy as np

class ModelRegistry:
    def __init__(self):
        self.model = None
        self.metrics = None
        self.model_version = "recovery_lightgbm_v1"
        self.is_loaded = False

    def load_models(self, model_path: str, metrics_path: str):
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.is_loaded = True
                print(f"Loaded LightGBM model successfully from {model_path}")
            except Exception as e:
                print(f"Warning: Failed to load model from {model_path} ({e}). Retraining model pipeline...")
                self._retrain_and_load(model_path, metrics_path)
        else:
            print(f"Model file not found at {model_path}. Auto-training model pipeline...")
            self._retrain_and_load(model_path, metrics_path)

        if os.path.exists(metrics_path):
            try:
                with open(metrics_path, 'r') as f:
                    self.metrics = json.load(f)
            except Exception as e:
                print(f"Warning: Failed to read metrics from {metrics_path}: {e}")

    def _retrain_and_load(self, model_path: str, metrics_path: str):
        try:
            from scripts.train_pipeline import train_and_evaluate
            train_and_evaluate()
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.is_loaded = True
                print("Retrained and loaded fresh LightGBM model successfully.")
        except Exception as e:
            print(f"Error during auto-retraining: {e}. System will utilize rule-based fallback.")

    def predict_probability(self, features_dict: dict) -> float:
        if self.is_loaded and self.model is not None:
            df_feat = pd.DataFrame([features_dict])
            # Drop target/ID fields if present
            for col in ['payment_id', 'customer_id', 'merchant_id', 'currency', 'case_id', 'target_recovered', 'risk_score']:
                if col in df_feat.columns:
                    df_feat = df_feat.drop(columns=[col])
            try:
                prob = self.model.predict_proba(df_feat)[0, 1]
                return float(np.round(prob, 4))
            except Exception as e:
                print(f"Error during ML model inference: {e}. Falling back to deterministic rules.")
        
        # Rule-based fallback calculation if model binary missing or invalid
        code = features_dict.get('failure_code', '')
        if code == 'TRANSIENT_FAILURE':
            return 0.88
        elif code == 'INSUFFICIENT_FUNDS':
            return 0.45
        elif code == 'EXPIRED_CARD':
            return 0.72
        elif code == 'FRAUD_SUSPECTED':
            return 0.05
        return 0.50

model_registry = ModelRegistry()
