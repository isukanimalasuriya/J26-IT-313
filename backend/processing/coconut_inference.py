
import os
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import sys
import json
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf
from ultralytics import YOLO


# --------------------------------------------------
# Paths and model configuration
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "trained_models" / "coconut"

DETECTOR_PATH = MODEL_DIR / "coconut_yolov8n.pt"
CLASSIFIER_PATH = MODEL_DIR / "efficientnetb2_stage2_best.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"

IMAGE_SIZE = 260
CONFIDENCE_THRESHOLD = 0.25


def analyze_image(image_path: str) -> dict:
    """Detect coconuts and classify each detected crop."""

    image_file = Path(image_path)

    if not image_file.is_file():
        raise FileNotFoundError("Uploaded image file was not found.")

    for model_path in (
        DETECTOR_PATH,
        CLASSIFIER_PATH,
        CLASS_NAMES_PATH,
    ):
        if not model_path.is_file():
            raise FileNotFoundError(
                f"Required model file is missing: {model_path.name}"
            )

    with CLASS_NAMES_PATH.open("r", encoding="utf-8") as file:
        class_names = json.load(file)

    expected_classes = ["dry", "immature", "matured", "tender"]

    if class_names != expected_classes:
        raise ValueError("The maturity class mapping is incorrect.")

    # Load the uploaded image.
    image_bgr = cv2.imread(str(image_file))

    if image_bgr is None:
        raise ValueError("The uploaded file is not a readable image.")

    height, width = image_bgr.shape[:2]
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    # Load both trained models.
    detector = YOLO(str(DETECTOR_PATH))
    classifier = tf.keras.models.load_model(
        str(CLASSIFIER_PATH),
        compile=False,
    )

    # Detect individual coconuts.
    detection_result = detector.predict(
        image_bgr,
        conf=CONFIDENCE_THRESHOLD,
        verbose=False,
    )[0]

    detections = []

    if detection_result.boxes is not None:
        boxes = detection_result.boxes.xyxy.cpu().numpy()

        for box_index, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box)

            # Keep coordinates inside the image.
            x1 = max(0, min(x1, width - 1))
            y1 = max(0, min(y1, height - 1))
            x2 = max(0, min(x2, width))
            y2 = max(0, min(y2, height))

            if x2 <= x1 or y2 <= y1:
                continue

            crop_rgb = image_rgb[y1:y2, x1:x2]

            # Match the notebook's preprocessing:
            # RGB crop, resized to 260x260, float32,
            # without manual division by 255.
            crop_resized = cv2.resize(
                crop_rgb,
                (IMAGE_SIZE, IMAGE_SIZE),
            )
            crop_tensor = np.expand_dims(
                crop_resized.astype(np.float32),
                axis=0,
            )

            probabilities = classifier.predict(
                crop_tensor,
                verbose=0,
            )[0]

            if len(probabilities) != len(class_names):
                raise ValueError(
                    "Classifier output does not match the class mapping."
                )

            predicted_index = int(np.argmax(probabilities))
            predicted_class = class_names[predicted_index]
            maturity_confidence = float(
                probabilities[predicted_index]
            )

            detections.append({
                "coconut_index": len(detections) + 1,
                "bounding_box": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2,
                },
                "maturity": predicted_class,
                "maturity_confidence": round(
                    maturity_confidence, 4
                ),
                "detection_confidence": round(
                    float(
                        detection_result.boxes.conf[
                            box_index
                        ].item()
                    ),
                    4,
                ),
            })

    maturity_counts = {
        class_name: sum(
            item["maturity"] == class_name
            for item in detections
        )
        for class_name in class_names
    }

    return {
        "success": True,
        "image_dimensions": {
            "width": width,
            "height": height,
        },
        "detected_coconut_count": len(detections),
        "maturity_counts": maturity_counts,
        "detections": detections,
    }


if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            raise ValueError(
                "Usage: python coconut_inference.py <image_path>"
            )

        result = analyze_image(sys.argv[1])
        print(json.dumps(result))

    except Exception as error:
        print(
            json.dumps({
                "success": False,
                "error": str(error),
            }),
            file=sys.stderr,
        )
        sys.exit(1)
