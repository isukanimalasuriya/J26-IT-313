# Trained Machine Learning Models Directory

This directory stores serialized trained machine learning models, preprocessors, encoders, and artifacts.

## Current Artifacts
- `fertilizer_model.json` / `fertilizer_model.joblib`: Trained XGBoost model for fertilizer prediction.
- `preprocessor.joblib`: Fitted Scikit-Learn data preprocessor / pipeline.
- `disease/mobilenetv2_100 (2).onnx`: Four-class MobileNetV2 disease classifier used by
  `processing/disease_api.py`. Its output order is `WCLWD`, `gray_spot`, `healthy`,
  `whitefly`.

The disease API is started automatically with `npm start` and listens on port 8000 by
default. Set `DISEASE_LABELS` in `.env` only when using a model with a different
training class order.

## Guidelines
- Store versioned models (e.g. `v1/`, `v2/`) or export weights here.
- For files larger than 100MB, use Git LFS or load directly from S3 bucket via `s3_service`.
