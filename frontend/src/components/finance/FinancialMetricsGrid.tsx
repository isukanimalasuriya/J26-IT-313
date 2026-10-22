import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { ForecastData } from "./types";

interface Props {
  forecast: ForecastData;
  nutPrice: string;
}

export function FinancialMetricsGrid({ forecast, nutPrice }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.metricGrid}>
      {/* Revenue Card */}
      <View style={[styles.metricCard, isDark && styles.metricCardDark]}>
        <Icon name="arrow-up-circle-outline" size={20} color="#059669" />
        <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
          Expected Revenue
        </Text>
        <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
          Rs. {Math.round(forecast.expected_revenue_lkr).toLocaleString()}
        </Text>
        <Text style={[styles.metricSub, isDark && styles.metricSubDark]}>
          @ Rs. {nutPrice}/nut
        </Text>
      </View>

      {/* Cost Card */}
      <View style={[styles.metricCard, isDark && styles.metricCardDark]}>
        <Icon name="arrow-down-circle-outline" size={20} color="#DC2626" />
        <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
          Total Costs
        </Text>
        <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
          Rs. {Math.round(forecast.total_cultivation_cost_lkr).toLocaleString()}
        </Text>
        <Text style={[styles.metricSub, isDark && styles.metricSubDark]}>
          CRI Norms
        </Text>
      </View>

      {/* Yield Card */}
      <View style={[styles.metricCard, isDark && styles.metricCardDark]}>
        <Icon name="fruit-cherries" size={20} color="#D97706" />
        <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
          Estimated Yield
        </Text>
        <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
          {forecast.estimated_yield_nuts.toLocaleString()}
        </Text>
        <Text style={[styles.metricSub, isDark && styles.metricSubDark]}>
          Nuts / 60 days
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5ECE4",
    alignItems: "flex-start",
  },
  metricCardDark: {
    backgroundColor: "#1E222A",
    borderColor: "#2D3440",
  },
  metricLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
    fontWeight: "500",
  },
  metricLabelDark: {
    color: "#9CA3AF",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginVertical: 2,
  },
  metricValueDark: {
    color: "#F3F4F6",
  },
  metricSub: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  metricSubDark: {
    color: "#6B7280",
  },
});
