import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, average_precision_score
import lightgbm as lgb

from generate_dataset import generate_synthetic_data

def train_and_evaluate():
    ai_service_dir = os.path.dirname(script_dir)
    models_dir = os.path.join(ai_service_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    df = generate_synthetic_data()

    X = df.drop(columns=['target_recovered', 'risk_score'])
    y = df['target_recovered']

    categorical_cols = ['payment_method', 'failure_code', 'customer_segment']
    numerical_cols = [c for c in X.columns if c not in categorical_cols]

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ]
    )

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    X_train_val, X_val, y_train_val, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42, stratify=y_train)

    print(f"Dataset split: Train={len(X_train_val)}, Val={len(X_val)}, Test={len(X_test)}")

    # 1. Baseline Model: Logistic Regression
    lr_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(max_iter=1000, random_state=42))
    ])
    lr_pipeline.fit(X_train_val, y_train_val)
    lr_preds = lr_pipeline.predict(X_test)
    lr_probs = lr_pipeline.predict_proba(X_test)[:, 1]

    # 2. Primary Model: LightGBM
    lgb_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', lgb.LGBMClassifier(n_estimators=150, learning_rate=0.05, random_state=42, verbose=-1))
    ])
    lgb_pipeline.fit(X_train_val, y_train_val)
    lgb_preds = lgb_pipeline.predict(X_test)
    lgb_probs = lgb_pipeline.predict_proba(X_test)[:, 1]

    # Metrics
    metrics = {
        'model_name': 'LightGBM Classifier',
        'model_version': 'recovery_lightgbm_v1',
        'trained_at': datetime.utcnow().isoformat(),
        'feature_version': 'v1',
        'dataset_size': len(df),
        'metrics': {
            'accuracy': float(accuracy_score(y_test, lgb_preds)),
            'precision': float(precision_score(y_test, lgb_preds)),
            'recall': float(recall_score(y_test, lgb_preds)),
            'f1_score': float(f1_score(y_test, lgb_preds)),
            'roc_auc': float(roc_auc_score(y_test, lgb_probs)),
            'pr_auc': float(average_precision_score(y_test, lgb_probs)),
            'confusion_matrix': confusion_matrix(y_test, lgb_preds).tolist()
        },
        'baseline_metrics': {
            'accuracy': float(accuracy_score(y_test, lr_preds)),
            'f1_score': float(f1_score(y_test, lr_preds)),
            'roc_auc': float(roc_auc_score(y_test, lr_probs))
        }
    }

    model_file = os.path.join(models_dir, 'recovery_lightgbm_v1.joblib')
    metrics_file = os.path.join(models_dir, 'metrics_v1.json')

    joblib.dump(lgb_pipeline, model_file)
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"Primary LightGBM Model saved to {model_file}")
    print(f"Evaluation Metrics saved to {metrics_file}")
    print(f"ROC-AUC: {metrics['metrics']['roc_auc']:.4f}, F1-Score: {metrics['metrics']['f1_score']:.4f}")

if __name__ == '__main__':
    train_and_evaluate()
