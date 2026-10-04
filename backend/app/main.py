from sklearn.pipeline import Pipeline
from xgboost import XGBRegressor
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal
import logging
import math
import os

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field


class FertilizerInput(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)
    tree_age_years: int = Field(ge=0)
    soil_ph: float = Field(ge=0, le=14)
    nitrogen_mg_kg: float = Field(ge=0)
    phosphorus_mg_kg: float = Field(ge=0)
    potassium_mg_kg: float = Field(ge=0)
    soil_moisture_pct: float = Field(ge=0, le=100)
    salinity_ds_m: float = Field(ge=0)
    organic_matter_pct: float = Field(ge=0, le=100)
    slope_angle_deg: float = Field(ge=0, le=90)
    mulch_present: Literal[0, 1]
    rainfall_previous_7d_mm: float = Field(ge=0)
    rainfall_forecast_7d_mm: float = Field(ge=0)
    days_since_last_fertilizer: int = Field(ge=0)
    agro_climatic_zone: Literal['dry', 'intermediate', 'wet']
    season: Literal['first_half', 'second_half']
    soil_texture: Literal['clay', 'clay_loam', 'loam', 'sandy', 'sandy_loam']
    coconut_variety: Literal['CRIC60', 'CRIC65', 'Dwarf', 'Tall']
    growth_stage: Literal['bearing', 'immature', 'mature']
    rainfall_intensity: Literal['heavy', 'low', 'moderate']


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_dir = Path(__file__).resolve().parent / "ml"

    # Load the fitted preprocessing steps.
    preprocessor = joblib.load(model_dir / "preprocessor.joblib")

    # Load the trained XGBoost model in portable JSON format.
    model = XGBRegressor()
    model.load_model(model_dir / "fertilizer_model.json")

    # Combine preprocessing and prediction.
    app.state.pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    expected = list(app.state.pipeline.feature_names_in_)

    if set(expected) != set(FertilizerInput.model_fields):
        raise RuntimeError(
            "Model features do not match the API input schema."
        )

    app.state.features = expected
    yield


app = FastAPI(title='Coconut Fertilizer Prototype API', lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[s.strip() for s in os.getenv(
        'FRONTEND_ORIGINS', 'http://localhost:8081,http://127.0.0.1:8081'
    ).split(',') if s.strip()],
    allow_credentials=False,
    allow_methods=['GET', 'POST'],
    allow_headers=['Content-Type'],
)


@app.get('/')
def root():
    return {'message': 'Coconut Research API is running'}


@app.get('/api/health')
def health():
    return {'status': 'ok', 'message': 'Frontend connected to Python backend!', 'model_loaded': True}


@app.post('/api/predict')
def predict(body: FertilizerInput):
    row = pd.DataFrame([body.model_dump()], columns=app.state.features)
    try:
        amount = float(app.state.pipeline.predict(row)[0])
        if not math.isfinite(amount) or amount < 0:
            raise ValueError('Invalid model output')
    except Exception:
        logging.exception('Fertilizer prediction failed')
        raise HTTPException(status_code=500, detail='Prediction failed. Check the backend terminal.')
    return {
        'fertilizer_amount_kg_tree': round(amount, 3),
        'unit': 'kg/tree',
        'prototype_only': True,
        'message': 'Synthetic-data prototype estimate; not a validated fertilizer prescription.',
    }
