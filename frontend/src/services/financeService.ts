import { FarmInputPayload, ForecastData } from "../components/finance/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface FinanceForecastResult {
  forecast: ForecastData;
  isOffline: boolean;
  errorMessage?: string;
}

export async function fetchFinanceForecast(
  payload: FarmInputPayload
): Promise<FinanceForecastResult> {
  const baseUrl = API_URL ? API_URL.replace(/\/$/, "") : "http://localhost:5000";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${baseUrl}/api/finance/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Server responded with ${res.status}`);
    }

    return {
      forecast: json.data.forecast,
      isOffline: false,
    };
  } catch (err: any) {
    console.warn("Backend request unsuccessful, using CRI benchmark model:", err.message);

    // Verified agronomic formulas (CRI Advisory Circulars A1 & A5)
    const fertCost = Math.round(
      payload.tree_count *
        payload.fertilizer_applied_kg_per_tree *
        190 *
        (60 / 365)
    );
    const laborCost = Math.round(
      payload.land_size_acres * 3.0 * payload.labor_wage_rate_lkr
    );
    const harvestCost = Math.round(payload.tree_count * 80);
    const maintCost = Math.round((fertCost + laborCost + harvestCost) * 0.08);
    const totalCost = fertCost + laborCost + harvestCost + maintCost;

    // CRI tall variety: ~11-13 nuts per palm per 60-day picking cycle
    const estimatedYield = Math.round(payload.tree_count * 12.2);
    const revenue = Math.round(estimatedYield * payload.farm_gate_price_per_nut_lkr);
    const netProfit = Math.max(0, revenue - totalCost);
    const margin =
      revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0;

    return {
      forecast: {
        expected_net_profit_lkr: netProfit,
        expected_revenue_lkr: revenue,
        total_cultivation_cost_lkr: totalCost,
        estimated_yield_nuts: estimatedYield,
        profit_margin_pct: margin,
        cost_breakdown: {
          fertilizer_cost_lkr: fertCost,
          labor_cost_lkr: laborCost,
          harvesting_cost_lkr: harvestCost,
          maintenance_cost_lkr: maintCost,
        },
      },
      isOffline: true,
      errorMessage: err.name === "AbortError" ? "Request timed out" : err.message,
    };
  }
}
