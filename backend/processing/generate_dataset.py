"""
Standard Python Dataset Generator for Coconut Cultivation Financial Forecasting & Risk Assessment
Uses only standard library (random, math, csv) - no external packages required.

Grounded in Sri Lankan agricultural benchmarks:
- Coconut Research Institute (CRI) of Sri Lanka (Cultivation economics, fertilizer, tree yield)
- Coconut Development Authority (CDA) (Historical farm-gate and auction prices)
- Department of Meteorology, Sri Lanka (District rainfall & climate profiles)
- Hector Kobbekaduwa Agrarian Research and Training Institute (HARTI) / Dept. of Labour (Wages & input costs)
"""

import random
import math
import csv
from pathlib import Path

random.seed(42)

NUM_SAMPLES = 1500

DISTRICTS = ["Kurunegala", "Puttalam", "Gampaha", "Hambantota", "Kalutara", "Matara"]
DISTRICT_WEIGHTS = [0.40, 0.25, 0.15, 0.10, 0.05, 0.05]

LAND_SIZES = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 7.5, 10.0, 12.0, 15.0, 20.0, 25.0]
LAND_WEIGHTS = [0.08, 0.10, 0.12, 0.10, 0.12, 0.10, 0.12, 0.08, 0.05, 0.05, 0.03, 0.02, 0.02, 0.01]

BASE_PRICES = {
    "Kurunegala": 115.0,
    "Gampaha": 122.0,
    "Puttalam": 112.0,
    "Hambantota": 108.0,
    "Kalutara": 120.0,
    "Matara": 114.0
}

LABOR_RATES = [2500, 2750, 3000, 3250, 3500]

rows = []

for _ in range(NUM_SAMPLES):
    # 1. District
    district = random.choices(DISTRICTS, weights=DISTRICT_WEIGHTS, k=1)[0]

    # 2. Land Size (Acres)
    land_size = random.choices(LAND_SIZES, weights=LAND_WEIGHTS, k=1)[0]

    # 3. Tree Density per Acre (CRI standard ~64 palms/acre, 55 to 74 range)
    palms_per_acre = int(max(55, min(75, round(random.gauss(64, 4)))))
    tree_count = int(round(land_size * palms_per_acre))

    # 4. Tree Age (Years) - Bearing palms (8 to 55 years)
    tree_age = random.randint(8, 55)

    # 5. Climate / Weather Features (Dept. of Meteorology)
    if district in ["Gampaha", "Kalutara"]:
        # Wet Zone
        rf = max(35.0, random.gauss(190, 45))
        temp = random.gauss(28.5, 1.5)
        drought = max(0.0, min(1.0, (80.0 - rf) / 80.0 if rf < 80.0 else random.uniform(0.02, 0.12)))
    elif district in ["Kurunegala", "Matara"]:
        # Intermediate Zone
        rf = max(25.0, random.gauss(135, 40))
        temp = random.gauss(29.5, 1.8)
        drought = max(0.0, min(1.0, (70.0 - rf) / 70.0 if rf < 70.0 else random.uniform(0.05, 0.22)))
    else:
        # Puttalam / Hambantota (Dry Zone)
        rf = max(15.0, random.gauss(85, 35))
        temp = random.gauss(31.0, 2.0)
        drought = max(0.0, min(1.0, (65.0 - rf) / 65.0 if rf < 65.0 else random.uniform(0.18, 0.50)))

    monthly_rainfall_mm = round(rf, 1)
    avg_temperature_c = round(temp, 1)
    drought_severity_index = round(drought, 2)

    # 6. Cultivation Input Costs (CRI Advisory Circular No. B2, Adult Palm Mixture)
    # Fertilizer: 2.0 to 4.5 kg per tree/year; price 160-230 LKR/kg.
    # Adjusted for a 60-day (2-month) standard harvest cycle
    fert_kg_per_tree = round(random.uniform(2.0, 4.5), 2)
    fert_price_per_kg = random.uniform(160, 230)
    fertilizer_cost = round(tree_count * fert_kg_per_tree * fert_price_per_kg * (60.0 / 365.0), 2)

    # Labor Wage & Cultural Maintenance (Dept. of Labour & CGASL)
    labor_rate = random.choice(LABOR_RATES)
    man_days_per_acre = random.uniform(2.0, 4.0)
    labor_cost = round(land_size * man_days_per_acre * labor_rate, 2)

    # Harvesting (tree climbing & nut gathering) - CDA & Farm Services (65 to 95 LKR per tree per pick)
    harvest_rate = random.uniform(65, 95)
    harvesting_cost = round(tree_count * harvest_rate, 2)

    # Miscellaneous expenses (weed control, transport, fuel): 6-12% of above
    other_costs = round((fertilizer_cost + labor_cost + harvesting_cost) * random.uniform(0.06, 0.12), 2)

    total_cultivation_cost = round(fertilizer_cost + labor_cost + harvesting_cost + other_costs, 2)

    # 7. Yield Calculation (Per 2-month pick, 6 picks/year - CRI Agronomy Division)
    # Base yield per pick: ~10 to 14 nuts/palm
    base_nuts_pick = random.gauss(12.0, 1.5)

    # Age Factor
    if tree_age < 15:
        age_factor = 0.75 + (tree_age - 8) * 0.035
    elif tree_age <= 38:
        age_factor = 1.05 + random.uniform(-0.04, 0.04)
    else:
        age_factor = max(0.60, 1.0 - (tree_age - 38) * 0.022)

    # Weather & Fertilizer factors
    rf_capped = max(80.0, min(200.0, monthly_rainfall_mm))
    weather_factor = max(0.60, min(1.25, 1.0 - (drought_severity_index * 0.40) + ((rf_capped - 120.0) / 400.0)))
    fert_factor = max(0.80, min(1.20, 0.80 + (fert_kg_per_tree / 4.0) * 0.35))

    nuts_per_tree_pick = round(max(4.0, min(18.0, base_nuts_pick * age_factor * weather_factor * fert_factor)), 1)
    expected_yield_nuts = int(round(tree_count * nuts_per_tree_pick))

    # 8. Farm-Gate Market Price (LKR per nut - CDA Daily Bulletins)
    base_p = BASE_PRICES[district]
    farm_gate_price = round(max(75.0, min(140.0, random.gauss(base_p, 11.5))), 2)

    # 9. Revenue & Profit
    total_revenue = round(expected_yield_nuts * farm_gate_price, 2)
    net_profit = round(total_revenue - total_cultivation_cost, 2)
    profit_margin_pct = round((net_profit / total_revenue) * 100.0, 2) if total_revenue > 0 else 0.0

    # 10. Financial Risk Level
    if profit_margin_pct < 15.0 or drought_severity_index > 0.55:
        risk_lvl = "High"
    elif profit_margin_pct < 38.0 or drought_severity_index > 0.30:
        risk_lvl = "Medium"
    else:
        risk_lvl = "Low"

    rows.append({
        "district": district,
        "land_size_acres": land_size,
        "tree_count": tree_count,
        "tree_age_years": tree_age,
        "monthly_rainfall_mm": monthly_rainfall_mm,
        "avg_temperature_c": avg_temperature_c,
        "drought_severity_index": drought_severity_index,
        "fertilizer_applied_kg_per_tree": fert_kg_per_tree,
        "fertilizer_cost_lkr": fertilizer_cost,
        "labor_wage_rate_lkr": labor_rate,
        "labor_cost_lkr": labor_cost,
        "harvesting_cost_lkr": harvesting_cost,
        "total_cultivation_cost_lkr": total_cultivation_cost,
        "nuts_per_tree_pick": nuts_per_tree_pick,
        "expected_yield_nuts": expected_yield_nuts,
        "farm_gate_price_per_nut_lkr": farm_gate_price,
        "total_revenue_lkr": total_revenue,
        "net_profit_lkr": net_profit,
        "profit_margin_pct": profit_margin_pct,
        "risk_level": risk_lvl
    })

out_dir = Path(__file__).resolve().parent
csv_path = out_dir / "coconut_finance_dataset.csv"

fieldnames = list(rows[0].keys())
with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Successfully generated {len(rows)} records to: {csv_path}")
