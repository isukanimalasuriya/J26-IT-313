from __future__ import annotations

import io
import json
import os
from pathlib import Path
from typing import Annotated

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "trained_models" / "disease" / "mobilenetv2_100 (2).onnx"
SEVERITY_MODEL_PATH = BASE_DIR / "trained_models" / "severity" / "wclwd_stage.onnx"
SEVERITY_CONFIG_PATH = BASE_DIR / "trained_models" / "severity" / "severity_config.json"
DEFAULT_LABELS = ("WCLWD", "gray_spot", "healthy", "whitefly")
LABELS = tuple(
    label.strip()
    for label in os.getenv("DISEASE_LABELS", ",".join(DEFAULT_LABELS)).split(",")
    if label.strip()
)

if not MODEL_PATH.is_file():
    raise RuntimeError(f"Disease model not found: {MODEL_PATH}")
if not SEVERITY_MODEL_PATH.is_file():
    raise RuntimeError(f"Severity model not found: {SEVERITY_MODEL_PATH}")
if not SEVERITY_CONFIG_PATH.is_file():
    raise RuntimeError(f"Severity config not found: {SEVERITY_CONFIG_PATH}")
if len(LABELS) != 4:
    raise RuntimeError("DISEASE_LABELS must contain exactly four comma-separated labels")

session = ort.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
input_name = session.get_inputs()[0].name
severity_config = json.loads(SEVERITY_CONFIG_PATH.read_text(encoding="utf-8"))
severity_stages = tuple(severity_config["stages"])
severity_stage_text = severity_config["stage_text"]
severity_session = ort.InferenceSession(str(SEVERITY_MODEL_PATH), providers=["CPUExecutionProvider"])
severity_input_name = severity_session.get_inputs()[0].name

app = FastAPI(title="Coconut Disease Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def preprocess_image(contents: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from error

    image = image.resize((224, 224), Image.Resampling.BILINEAR)
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    pixels = (pixels - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / np.array(
        [0.229, 0.224, 0.225], dtype=np.float32
    )
    return np.transpose(pixels, (2, 0, 1))[None, ...]


def predict(image: np.ndarray) -> list[dict[str, float | str]]:
    logits = np.asarray(session.run(None, {input_name: image})[0][0], dtype=np.float32)
    logits -= np.max(logits)
    probabilities = np.exp(logits)
    probabilities /= np.sum(probabilities)
    ranked = np.argsort(probabilities)[::-1]
    return [
        {"label": LABELS[index], "confidence": round(float(probabilities[index]), 6)}
        for index in ranked
    ]


def predict_severity(image: np.ndarray) -> dict[str, float | str]:
    logits = np.asarray(
        severity_session.run(None, {severity_input_name: image})[0][0],
        dtype=np.float32,
    )
    logits -= np.max(logits)
    probabilities = np.exp(logits)
    probabilities /= np.sum(probabilities)
    stage_index = int(np.argmax(probabilities))
    confidence = round(float(probabilities[stage_index]), 6)
    stage = severity_stages[stage_index]
    return {
        "stage": stage,
        "label": severity_stage_text[stage],
        "confidence": confidence,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "online", "model": MODEL_PATH.name}


@app.post("/api/predict-disease")
async def predict_disease(file: Annotated[UploadFile, File(...)]) -> dict[str, object]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    image = preprocess_image(contents)
    predictions = predict(image)
    response: dict[str, object] = {
        "disease": predictions[0]["label"],
        "confidence": predictions[0]["confidence"],
    }
    if predictions[0]["label"].strip().lower() != "healthy":
        response["severity"] = predict_severity(image)
    return response
