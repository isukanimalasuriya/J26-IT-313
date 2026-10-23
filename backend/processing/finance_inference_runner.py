"""
Finance Inference Runner for Coconut Cultivation Financial Forecasting & Risk Assessment
Module: IT-313 Finance Module (IT23237490)
Loads trained XGBoost model and preprocessor to generate financial predictions and Monte Carlo risk scenarios.
"""

import sys
import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

DISTRICT_DEFAULTS = {
    "Kurunegala": {"rainfall": 135.0, "temp": 29.5, "drought": 0.12, "base_price": 125.0},
    "Puttalam": {"rainfall": 85.0, "temp": 31.0, "drought": 0.35, "base_price": 122.0},
    "Gampaha": {"rainfall": 190.0, "temp": 28.5, "drought": 0.06, "base_price": 126.0},
    "Hambantota": {"rainfall": 80.0, "temp": 31.5, "drought": 0.38, "base_price": 120.0},
    "Kalutara": {"rainfall": 210.0, "temp": 28.0, "drought": 0.05, "base_price": 124.0},
    "Matara": {"rainfall": 145.0, "temp": 29.0, "drought": 0.10, "base_price": 123.0}
}


def load_finance_pipeline(models_dir: Path):
    preprocessor = joblib.load(models_dir / "finance_preprocessor.joblib")
    model = XGBRegressor()
    model.load_model(models_dir / "finance_model.json")
    return preprocessor, model


def run_monte_carlo(base_dict: dict, preprocessor, model, iterations: int = 500):
    np.random.seed(42)
    sim_profits = []
    
    price = base_dict["farm_gate_price_per_nut_lkr"]
    rf = base_dict["monthly_rainfall_mm"]
    wage = base_dict["labor_wage_rate_lkr"]
    
    for _ in range(iterations):
        perturbed = base_dict.copy()
        perturbed["farm_gate_price_per_nut_lkr"] = max(70.0, np.random.normal(price, price * 0.12))
        rf_sim = max(20.0, np.random.normal(rf, rf * 0.20))
        perturbed["monthly_rainfall_mm"] = rf_sim
        perturbed["drought_severity_index"] = max(0.0, min(1.0, (75.0 - rf_sim) / 75.0 if rf_sim < 75 else 0.10))
        perturbed["labor_wage_rate_lkr"] = np.random.normal(wage, wage * 0.08)
        
        df_p = pd.DataFrame([perturbed])
        prep_p = preprocessor.transform(df_p)
        sim_profits.append(float(model.predict(prep_p)[0]))
        
    arr = np.array(sim_profits)
    loss_prob = float(np.mean(arr < 0) * 100)
    
    return {
        "worst_case_p5_lkr": round(float(np.percentile(arr, 5)), 2),
        "expected_median_p50_lkr": round(float(np.percentile(arr, 50)), 2),
        "best_case_p95_lkr": round(float(np.percentile(arr, 95)), 2),
        "probability_of_loss_pct": round(loss_prob, 1)
    }


def predict_finance(input_data: dict) -> dict:
    base_dir = Path(__file__).resolve().parent.parent
    models_dir = base_dir / "trained_models"
    preprocessor, model = load_finance_pipeline(models_dir)

    district = input_data.get("district", "Kurunegala")
    district_info = DISTRICT_DEFAULTS.get(district, DISTRICT_DEFAULTS["Kurunegala"])

    land_size = float(input_data.get("land_size_acres", 5.0))
    tree_count = int(input_data.get("tree_count", round(land_size * 64)))
    tree_age = int(input_data.get("tree_age_years", 25))
    monthly_rainfall = float(input_data.get("monthly_rainfall_mm", district_info["rainfall"]))
    avg_temp = float(input_data.get("avg_temperature_c", district_info["temp"]))
    drought_index = float(input_data.get("drought_severity_index", district_info["drought"]))
    fert_kg = float(input_data.get("fertilizer_applied_kg_per_tree", 3.5))
    labor_wage = float(input_data.get("labor_wage_rate_lkr", 3000.0))
    farm_gate_price = float(input_data.get("farm_gate_price_per_nut_lkr", district_info["base_price"]))

    model_features = {
        "district": district,
        "land_size_acres": land_size,
        "tree_count": tree_count,
        "tree_age_years": tree_age,
        "monthly_rainfall_mm": monthly_rainfall,
        "avg_temperature_c": avg_temp,
        "drought_severity_index": drought_index,
        "fertilizer_applied_kg_per_tree": fert_kg,
        "labor_wage_rate_lkr": labor_wage,
        "farm_gate_price_per_nut_lkr": farm_gate_price
    }

    df_in = pd.DataFrame([model_features])
    features_prep = preprocessor.transform(df_in)
    predicted_net_profit = float(model.predict(features_prep)[0])

    # Cost breakdown calculations grounded in CRI benchmarks (per 60-day cycle)
    fert_cost = round(tree_count * fert_kg * 190.0 * (60.0 / 365.0), 2)
    labor_cost = round(land_size * 3.0 * labor_wage, 2)
    harvest_cost = round(tree_count * 80.0, 2)
    maint_cost = round((fert_cost + labor_cost + harvest_cost) * 0.08, 2)
    total_cost = round(fert_cost + labor_cost + harvest_cost + maint_cost, 2)

    total_revenue = round(predicted_net_profit + total_cost, 2)
    estimated_yield = int(round(total_revenue / farm_gate_price)) if farm_gate_price > 0 else 0
    profit_margin = round((predicted_net_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0.0

    # Run Monte Carlo Risk Simulation
    mc_results = run_monte_carlo(model_features, preprocessor, model, iterations=500)

    # Determine risk level
    if profit_margin < 20.0 or drought_index > 0.45 or mc_results["probability_of_loss_pct"] > 10.0:
        risk_level = "High"
        risk_percentage = 45
    elif profit_margin < 40.0 or drought_index > 0.25:
        risk_level = "Medium"
        risk_percentage = 25
    else:
        risk_level = "Low"
        risk_percentage = 15

    return {
        "success": True,
        "currency": "LKR",
        "inputs": model_features,
        "forecast": {
            "expected_net_profit_lkr": round(predicted_net_profit, 2),
            "expected_revenue_lkr": total_revenue,
            "total_cultivation_cost_lkr": total_cost,
            "estimated_yield_nuts": estimated_yield,
            "profit_margin_pct": profit_margin,
            "cost_breakdown": {
                "fertilizer_cost_lkr": fert_cost,
                "labor_cost_lkr": labor_cost,
                "harvesting_cost_lkr": harvest_cost,
                "maintenance_cost_lkr": maint_cost
            }
        },
        "risk_assessment": {
            "overall_risk_level": risk_level,
            "risk_percentage": risk_percentage,
            "probability_of_loss_pct": mc_results["probability_of_loss_pct"],
            "worst_case_profit_lkr": mc_results["worst_case_p5_lkr"],
            "expected_median_profit_lkr": mc_results["expected_median_p50_lkr"],
            "best_case_profit_lkr": mc_results["best_case_p95_lkr"]
        },
        "market_context": {
            "current_nut_price_lkr": farm_gate_price,
            "one_month_forecast_price_lkr": round(farm_gate_price * 1.05, 2),
            "three_month_forecast_price_lkr": round(farm_gate_price * 1.15, 2),
            "recommended_selling_window": "Days 45 to 60 post-harvest",
            "recommended_budget_lkr": total_cost
        }
    }


if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            payload = json.loads(sys.argv[1])
            res = predict_finance(payload)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}), file=sys.stderr)
            sys.exit(1)
    else:
        # Default test run
        sample = {"district": "Kurunegala", "land_size_acres": 5.0}
        res = predict_finance(sample)
        print(json.dumps(res, indent=2))
