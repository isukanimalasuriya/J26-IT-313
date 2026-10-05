# Trained Machine Learning Models Directory

This directory stores serialized trained machine learning models, preprocessors, encoders, and artifacts.

## Current Artifacts
- `fertilizer_model.json` / `fertilizer_model.joblib`: Trained XGBoost model for fertilizer prediction.
- `preprocessor.joblib`: Fitted Scikit-Learn data preprocessor / pipeline.

## Guidelines
- Store versioned models (e.g. `v1/`, `v2/`) or export weights here.
- For files larger than 100MB, use Git LFS or load directly from S3 bucket via `s3_service`.
