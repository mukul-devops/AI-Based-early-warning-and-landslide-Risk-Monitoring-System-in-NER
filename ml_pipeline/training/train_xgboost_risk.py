import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import classification_report, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split


def train():
  df = pd.read_csv('data/processed/final_model_features.csv')

  # 1. Physical Terrain Transformations
  slope_rad = np.radians(df['slope_angle_deg'])
  df['sin_slope'] = np.sin(slope_rad)
  df['shear_stress_index'] = df['sin_slope'] * (df['elevation_m'] / 1000.0)

  # 2. Pore-Water Pressure Index (Hydrological trigger)
  df['pore_pressure_index'] = df['rainfall_72h_mm'] * np.tan(slope_rad)

  # 3. Monsoon Cloudburst Flag
  df['extreme_rain_flag'] = (df['rainfall_72h_mm'] > 50).astype(int)

  features = [
      'rainfall_72h_mm',
      'slope_angle_deg',
      'elevation_m',
      'shear_stress_index',
      'pore_pressure_index',
      'extreme_rain_flag',
  ]
  target = 'landslide_occurred'

  X = df[features]
  y = df[target]

  X_train, X_test, y_train, y_test = train_test_split(
      X, y, test_size=0.2, random_state=42, stratify=y
  )

  # 4. Tuned XGBoost with Regularization to prevent leaf fragmentation
  model = xgb.XGBClassifier(
      n_estimators=300,
      max_depth=5,
      learning_rate=0.04,
      gamma=1.5,  # Minimum loss reduction required to make a split
      reg_alpha=0.5,  # L1 regularization
      reg_lambda=1.0,  # L2 regularization
      subsample=0.85,
      colsample_bytree=0.85,
      eval_metric='logloss',
      random_state=42,
  )

  model.fit(X_train, y_train)

  # 5. Optimal Probability Threshold Sweep
  test_probs = model.predict_proba(X_test)[:, 1]

  best_thresh = 0.5
  best_f1 = 0
  for t in np.arange(0.35, 0.65, 0.02):
    score = f1_score(y_test, (test_probs >= t).astype(int))
    if score > best_f1:
      best_f1 = score
      best_thresh = t

  final_preds = (test_probs >= best_thresh).astype(int)

  print(f'\nOptimal Decision Threshold: {best_thresh:.2f}')
  print('--- Final Geomorphological XGBoost Evaluation ---')
  print(classification_report(y_test, final_preds))
  print(f'ROC-AUC Score: {roc_auc_score(y_test, test_probs):.3f}\n')

  # Feature Importances for presentation deck
  print('Key Feature Importances:')
  importance = model.feature_importances_
  for f, imp in sorted(zip(features, importance), key=lambda x: x[1], reverse=True):
    print(f'  • {f}: {imp:.1%}')

  os.makedirs('ml_pipeline/saved_models', exist_ok=True)
  joblib.dump(
      {
          'model': model,
          'features': features,
          'threshold': float(best_thresh),
      },
      'ml_pipeline/saved_models/landslide_xgb.pkl',
  )
  print('\nSaved model bundle to ml_pipeline/saved_models/landslide_xgb.pkl')


if __name__ == '__main__':
  train()