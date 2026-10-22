export interface DistrictConfig {
  name: string;
  basePrice: number;
  zone: string;
}

export interface CostBreakdown {
  fertilizer_cost_lkr: number;
  labor_cost_lkr: number;
  harvesting_cost_lkr: number;
  maintenance_cost_lkr: number;
}

export interface ForecastData {
  expected_net_profit_lkr: number;
  expected_revenue_lkr: number;
  total_cultivation_cost_lkr: number;
  estimated_yield_nuts: number;
  profit_margin_pct: number;
  cost_breakdown: CostBreakdown;
}

export interface FarmInputPayload {
  district: string;
  land_size_acres: number;
  tree_count: number;
  tree_age_years: number;
  farm_gate_price_per_nut_lkr: number;
  labor_wage_rate_lkr: number;
  fertilizer_applied_kg_per_tree: number;
}
