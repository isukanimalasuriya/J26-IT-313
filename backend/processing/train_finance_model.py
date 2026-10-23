"""
Google Colab Training Script: Coconut Financial Forecasting & Risk Assessment (IT-313)
Model: XGBoost Regressor (with Linear Regression & Random Forest Baselines)
Simulation: Monte Carlo Risk Assessment
Outputs:
  - finance_model.json
  - finance_preprocessor.joblib
  - model_metrics.json
  - Evaluation plots (Actual vs Predicted, Feature Importance, Monte Carlo Risk Distribution)
"""

# ==========================================
# CELL 1: Install & Import Libraries
# ==========================================
# In Google Colab, run this first:
# !pip install xgboost scikit-learn pandas numpy matplotlib seaborn joblib

import json
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error, r2_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import xgboost as xgb
from xgboost import XGBRegressor
import joblib

# Set visualization style
sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (10, 6)
plt.rcParams["font.size"] = 11

print("All libraries imported successfully!")

# ==========================================
# CELL 2: Upload and Load Dataset
# ==========================================
# In Google Colab, you can upload the file:
# from google.colab import files
# uploaded = files.upload() # Choose 'coconut_finance_dataset.csv'

dataset_path = "coconut_finance_dataset.csv"
df = pd.read_csv(dataset_path)

print(f"Dataset Loaded Successfully! Shape: {df.shape}")
print("\nFirst 3 records:")
print(df[["district", "land_size_acres", "tree_count", "monthly_rainfall_mm", "farm_gate_price_per_nut_lkr", "net_profit_lkr"]].head(3))

# ==========================================
# CELL 3: Feature Engineering & Preprocessing Pipeline
# ==========================================
# Define Feature Columns (X) and Target (y)
categorical_features = ["district"]
numerical_features = [
    "land_size_acres",
    "tree_count",
    "tree_age_years",
    "monthly_rainfall_mm",
    "avg_temperature_c",
    "drought_severity_index",
    "fertilizer_applied_kg_per_tree",
    "labor_wage_rate_lkr",
    "farm_gate_price_per_nut_lkr"
]

target_col = "net_profit_lkr"

X = df[categorical_features + numerical_features]
y = df[target_col]

# Split 80% Train, 20% Test (Random state 42 for exact reproducibility)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

# Build Preprocessor: One-Hot Encode categorical, Scale numerical
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numerical_features),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
    ]
)

# Fit preprocessor on training data
X_train_prep = preprocessor.fit_transform(X_train)
X_test_prep = preprocessor.transform(X_test)

print(f"Preprocessed Train feature matrix shape: {X_train_prep.shape}")
print(f"Preprocessed Test feature matrix shape: {X_test_prep.shape}")

# ==========================================
# CELL 4: Model Training (XGBoost + Baseline Comparison)
# ==========================================
# Required for Proposal Evaluation: Compare XGBoost against Linear Regression & Random Forest

models = {
    "Linear Regression (Baseline)": LinearRegression(),
    "Random Forest (Baseline)": RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42),
    "XGBoost Regressor (Proposed)": XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )
}

results = []

for name, model in models.items():
    model.fit(X_train_prep, y_train)
    y_pred = model.predict(X_test_prep)
    
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mape = mean_absolute_percentage_error(y_test, y_pred) * 100
    
    results.append({
        "Model": name,
        "R2 Score": round(r2, 4),
        "MAE (LKR)": round(mae, 2),
        "RMSE (LKR)": round(rmse, 2),
        "MAPE (%)": round(mape, 2)
    })

results_df = pd.DataFrame(results)
print("\n" + "="*60)
print("     MODEL EVALUATION & BASELINE COMPARISON TABLE (FOR PPT1)")
print("="*60)
print(results_df.to_string(index=False))

# Best Model: XGBoost
best_xgb_model = models["XGBoost Regressor (Proposed)"]
y_test_pred_xgb = best_xgb_model.predict(X_test_prep)

# ==========================================
# CELL 5: Visualizations for PPT1 Presentation Slides
# ==========================================
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Plot 1: Model Comparison (R2 Score)
sns.barplot(data=results_df, x="Model", y="R2 Score", ax=axes[0], palette="viridis")
axes[0].set_title("Model Comparison: Coefficient of Determination (R²)", fontsize=14, fontweight="bold")
axes[0].set_ylim(0, 1.1)
for p in axes[0].patches:
    axes[0].annotate(f"{p.get_height():.3f}", (p.get_x() + p.get_width() / 2., p.get_height() / 2.),
                     ha='center', va='center', fontsize=12, color='white', fontweight='bold')

# Plot 2: Actual vs Predicted Net Profit (XGBoost)
axes[1].scatter(y_test, y_test_pred_xgb, alpha=0.6, color="teal", edgecolors="k", s=40)
min_val = min(y_test.min(), y_test_pred_xgb.min())
max_val = max(y_test.max(), y_test_pred_xgb.max())
axes[1].plot([min_val, max_val], [min_val, max_val], color="crimson", linestyle="--", linewidth=2, label="Perfect Fit (y=x)")
axes[1].set_title("XGBoost: Actual vs Predicted Net Profit (LKR)", fontsize=14, fontweight="bold")
axes[1].set_xlabel("Actual Net Profit (LKR)")
axes[1].set_ylabel("Predicted Net Profit (LKR)")
axes[1].legend()

plt.tight_layout()
plt.savefig("model_comparison_and_fit.png", dpi=300)
plt.show()

# ==========================================
# CELL 6: Feature Importance Analysis (Novelty for Panel Feedback)
# ==========================================
# Extract feature names after one-hot encoding
cat_encoded_cols = list(preprocessor.named_transformers_["cat"].get_feature_names_out(categorical_features))
all_feature_names = numerical_features + cat_encoded_cols

importance_df = pd.DataFrame({
    "Feature": all_feature_names,
    "Importance": best_xgb_model.feature_importances_
}).sort_values(by="Importance", ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=importance_df, x="Importance", y="Feature", palette="mako")
plt.title("XGBoost Feature Importance: Financial Profit Drivers", fontsize=14, fontweight="bold")
plt.xlabel("Relative Importance Weight")
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=300)
plt.show()

# ==========================================
# CELL 7: Monte Carlo Risk Simulation (Objective 3)
# ==========================================
def run_monte_carlo_simulation(base_input: dict, pipeline_preprocessor, model, iterations: int = 1000):
    """
    Monte Carlo Simulation:
    Perturbs volatile environmental and market parameters:
    - Market price (CDA price volatility +/- 15%)
    - Monthly rainfall (Weather uncertainty +/- 25%)
    - Labor rates (+/- 10%)
    """
    np.random.seed(42)
    simulated_profits = []
    
    base_price = base_input["farm_gate_price_per_nut_lkr"]
    base_rf = base_input["monthly_rainfall_mm"]
    base_wage = base_input["labor_wage_rate_lkr"]
    
    for _ in range(iterations):
        perturbed_input = base_input.copy()
        
        # Simulate market price shock
        perturbed_input["farm_gate_price_per_nut_lkr"] = max(70.0, np.random.normal(base_price, base_price * 0.12))
        # Simulate weather shock (rainfall fluctuation)
        perturbed_rf = max(20.0, np.random.normal(base_rf, base_rf * 0.20))
        perturbed_input["monthly_rainfall_mm"] = perturbed_rf
        perturbed_input["drought_severity_index"] = max(0.0, min(1.0, (75.0 - perturbed_rf)/75.0 if perturbed_rf < 75 else 0.10))
        # Simulate labor cost drift
        perturbed_input["labor_wage_rate_lkr"] = np.random.normal(base_wage, base_wage * 0.08)
        
        df_single = pd.DataFrame([perturbed_input])[categorical_features + numerical_features]
        prep_single = pipeline_preprocessor.transform(df_single)
        pred_profit = float(model.predict(prep_single)[0])
        simulated_profits.append(pred_profit)
        
    simulated_profits = np.array(simulated_profits)
    
    mean_profit = np.mean(simulated_profits)
    p5 = np.percentile(simulated_profits, 5)   # Worst 5% case (Value at Risk)
    p50 = np.percentile(simulated_profits, 50) # Median expected case
    p95 = np.percentile(simulated_profits, 95) # Best 5% case
    
    prob_of_loss = np.mean(simulated_profits < 0) * 100
    
    return {
        "mean_profit_lkr": round(mean_profit, 2),
        "worst_case_p5_lkr": round(p5, 2),
        "expected_median_p50_lkr": round(p50, 2),
        "best_case_p95_lkr": round(p95, 2),
        "probability_of_loss_pct": round(prob_of_loss, 2),
        "simulated_distribution": simulated_profits
    }

# Test Monte Carlo on a sample farm
sample_farm = {
    "district": "Kurunegala",
    "land_size_acres": 5.0,
    "tree_count": 320,
    "tree_age_years": 25,
    "monthly_rainfall_mm": 130.0,
    "avg_temperature_c": 29.5,
    "drought_severity_index": 0.12,
    "fertilizer_applied_kg_per_tree": 3.5,
    "labor_wage_rate_lkr": 3000,
    "farm_gate_price_per_nut_lkr": 118.0
}

simulation_results = run_monte_carlo_simulation(sample_farm, preprocessor, best_xgb_model, iterations=1000)

print("\n" + "="*60)
print("     MONTE CARLO RISK SIMULATION RESULTS (1,000 SCENARIOS)")
print("="*60)
print(f"Sample Farm: {sample_farm['district']}, {sample_farm['land_size_acres']} Acres, {sample_farm['tree_count']} Palms")
print(f"Expected Median Profit (P50) : LKR {simulation_results['expected_median_p50_lkr']:,.2f}")
print(f"Worst-Case Outcome (P5 VaR)  : LKR {simulation_results['worst_case_p5_lkr']:,.2f}")
print(f"Best-Case Outcome (P95)      : LKR {simulation_results['best_case_p95_lkr']:,.2f}")
print(f"Probability of Financial Loss: {simulation_results['probability_of_loss_pct']}%")

# Plot Monte Carlo Distribution
plt.figure(figsize=(10, 5))
sns.histplot(simulation_results["simulated_distribution"], kde=True, color="darkgreen", bins=30)
plt.axvline(simulation_results['worst_case_p5_lkr'], color='red', linestyle='--', label=f"5th Percentile (Worst-Case): LKR {simulation_results['worst_case_p5_lkr']:,.0f}")
plt.axvline(simulation_results['expected_median_p50_lkr'], color='blue', linestyle='-', label=f"Median: LKR {simulation_results['expected_median_p50_lkr']:,.0f}")
plt.axvline(simulation_results['best_case_p95_lkr'], color='orange', linestyle='--', label=f"95th Percentile (Best-Case): LKR {simulation_results['best_case_p95_lkr']:,.0f}")
plt.title("Monte Carlo Risk Distribution: Simulated Profit Scenarios", fontsize=14, fontweight="bold")
plt.xlabel("Simulated Net Profit (LKR)")
plt.ylabel("Scenario Frequency")
plt.legend()
plt.tight_layout()
plt.savefig("monte_carlo_risk_distribution.png", dpi=300)
plt.show()

# ==========================================
# CELL 8: Export Trained Artifacts for Backend
# ==========================================
# 1. Export Preprocessor
joblib.dump(preprocessor, "finance_preprocessor.joblib")

# 2. Export XGBoost Model (JSON format for standard cross-language loading)
best_xgb_model.save_model("finance_model.json")

# 3. Export Summary Metrics
metrics_dict = {
    "model_name": "XGBoost Regressor",
    "r2_score": float(results_df[results_df["Model"].str.contains("XGBoost")]["R2 Score"].values[0]),
    "mae_lkr": float(results_df[results_df["Model"].str.contains("XGBoost")]["MAE (LKR)"].values[0]),
    "rmse_lkr": float(results_df[results_df["Model"].str.contains("XGBoost")]["RMSE (LKR)"].values[0]),
    "mape_pct": float(results_df[results_df["Model"].str.contains("XGBoost")]["MAPE (%)"].values[0])
}

with open("model_metrics.json", "w") as f:
    json.dump(metrics_dict, f, indent=4)

print("\nModel Artifacts Successfully Exported:")
print(" - finance_preprocessor.joblib")
print(" - finance_model.json")
print(" - model_metrics.json")
print(" - model_comparison_and_fit.png")
print(" - feature_importance.png")
print(" - monte_carlo_risk_distribution.png")

# In Google Colab, download files to your computer:
# from google.colab import files
# files.download('finance_model.json')
# files.download('finance_preprocessor.joblib')
# files.download('model_metrics.json')
