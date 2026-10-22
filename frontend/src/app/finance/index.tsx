import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { FinanceHeader } from "@/components/finance/FinanceHeader";
import { FarmParametersForm } from "@/components/finance/FarmParametersForm";
import { ProfitHeroCard } from "@/components/finance/ProfitHeroCard";
import { FinancialMetricsGrid } from "@/components/finance/FinancialMetricsGrid";
import { CostBreakdownCard } from "@/components/finance/CostBreakdownCard";
import { DistrictConfig, ForecastData } from "@/components/finance/types";
import { CRI_PALMS_PER_ACRE } from "@/components/finance/constants";
import { fetchFinanceForecast } from "@/services/financeService";

export default function FinanceScreen() {
  const isDark = useColorScheme() === "dark";

  const [district, setDistrict] = useState("Kurunegala");
  const [landSize, setLandSize] = useState("5.0");
  const [treeCount, setTreeCount] = useState("320");
  const [treeAge, setTreeAge] = useState("25");
  const [nutPrice, setNutPrice] = useState("125");
  const [laborWage, setLaborWage] = useState("3000");
  const [fertilizerKg, setFertilizerKg] = useState("3.5");

  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  function handleLandSizeChange(val: string) {
    setLandSize(val);
    const acres = parseFloat(val);
    if (!isNaN(acres) && acres > 0) {
      setTreeCount(Math.round(acres * CRI_PALMS_PER_ACRE).toString());
    }
  }

  function handleDistrictSelect(d: DistrictConfig) {
    setDistrict(d.name);
    setNutPrice(d.basePrice.toString());
  }

  async function handleCalculate() {
    setLoading(true);
    setOfflineNotice(null);

    const acres = parseFloat(landSize) || 5.0;
    const palms = parseInt(treeCount, 10) || Math.round(acres * CRI_PALMS_PER_ACRE);
    const age = parseInt(treeAge, 10) || 25;
    const price = parseFloat(nutPrice) || 125;
    const wage = parseFloat(laborWage) || 3000;
    const fert = parseFloat(fertilizerKg) || 3.5;

    const payload = {
      district,
      land_size_acres: acres,
      tree_count: palms,
      tree_age_years: age,
      farm_gate_price_per_nut_lkr: price,
      labor_wage_rate_lkr: wage,
      fertilizer_applied_kg_per_tree: fert,
    };

    const result = await fetchFinanceForecast(payload);
    setForecast(result.forecast);

    if (result.isOffline) {
      setOfflineNotice(
        "Offline estimation mode (CRI standard agronomic calculation). Check server IP in .env for live ML backend."
      );
    }

    setLoading(false);
  }

  return (
    <SafeAreaView
      style={[styles.safe, isDark && styles.safeDark]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FinanceHeader />

        <FarmParametersForm
          district={district}
          onDistrictSelect={handleDistrictSelect}
          landSize={landSize}
          onLandSizeChange={handleLandSizeChange}
          treeCount={treeCount}
          onTreeCountChange={setTreeCount}
          treeAge={treeAge}
          onTreeAgeChange={setTreeAge}
          nutPrice={nutPrice}
          onNutPriceChange={setNutPrice}
          laborWage={laborWage}
          onLaborWageChange={setLaborWage}
          fertilizerKg={fertilizerKg}
          onFertilizerKgChange={setFertilizerKg}
          loading={loading}
          onCalculate={handleCalculate}
        />

        {offlineNotice && (
          <View style={[styles.noticeBox, isDark && styles.noticeBoxDark]}>
            <Icon name="information-outline" size={16} color="#D97706" />
            <Text style={[styles.noticeText, isDark && styles.noticeTextDark]}>
              {offlineNotice}
            </Text>
            <Pressable onPress={() => setOfflineNotice(null)}>
              <Icon name="close" size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        )}

        {forecast && (
          <View style={styles.resultsContainer}>
            <ProfitHeroCard
              forecast={forecast}
              landSize={landSize}
              treeCount={treeCount}
            />

            <FinancialMetricsGrid
              forecast={forecast}
              nutPrice={nutPrice}
            />

            <CostBreakdownCard
              costBreakdown={forecast.cost_breakdown}
              totalCost={forecast.total_cultivation_cost_lkr}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F7F4",
  },
  safeDark: {
    backgroundColor: "#12141A",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  noticeBoxDark: {
    backgroundColor: "rgba(217, 119, 6, 0.15)",
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 16,
  },
  noticeTextDark: {
    color: "#FCD34D",
  },
  resultsContainer: {
    marginTop: 4,
  },
});
