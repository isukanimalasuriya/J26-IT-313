from __future__ import annotations

import io
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
DEFAULT_LABELS = ("WCLWD", "gray_spot", "healthy", "whitefly")
LABELS = tuple(
    label.strip()
    for label in os.getenv("DISEASE_LABELS", ",".join(DEFAULT_LABELS)).split(",")
    if label.strip()
)

if not MODEL_PATH.is_file():
    raise RuntimeError(f"Disease model not found: {MODEL_PATH}")
if len(LABELS) != 4:
    raise RuntimeError("DISEASE_LABELS must contain exactly four comma-separated labels")

session = ort.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
input_name = session.get_inputs()[0].name

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

    predictions = predict(preprocess_image(contents))
    return {
        "disease": predictions[0]["label"],
        "confidence": predictions[0]["confidence"],
    }
