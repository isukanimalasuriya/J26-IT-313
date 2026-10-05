"""
Python Inference Runner for Trained Models
Can be invoked by the Node.js backend via child_process (e.g., spawn/exec) or run standalone.
"""
import sys
import json
from pathlib import Path
import joblib
from xgboost import XGBRegressor
from sklearn.pipeline import Pipeline
import pandas as pd


def load_model(models_dir: Path):
    preprocessor = joblib.load(models_dir / "preprocessor.joblib")
    model = XGBRegressor()
    model.load_model(models_dir / "fertilizer_model.json")
    return Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])


def predict(input_data: dict):
    base_dir = Path(__file__).resolve().parent.parent
    models_dir = base_dir / "trained_models"
    pipeline = load_model(models_dir)

    df = pd.DataFrame([input_data])
    result = float(pipeline.predict(df)[0])
    return {
        "prediction": round(result, 3),
        "unit": "kg/tree"
    }


if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            payload = json.loads(sys.argv[1])
            output = predict(payload)
            print(json.dumps(output))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
    else:
        print("Usage: python inference_runner.py '<json_string>'")
