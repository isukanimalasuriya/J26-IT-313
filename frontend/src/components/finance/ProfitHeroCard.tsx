import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ForecastData } from "./types";

interface Props {
  forecast: ForecastData;
  landSize: string;
  treeCount: string;
}

export function ProfitHeroCard({ forecast, landSize, treeCount }: Props) {
  const palms = Math.max(1, parseInt(treeCount, 10) || 1);
  const profitPerPalm = Math.round(forecast.expected_net_profit_lkr / palms);

  return (
    <LinearGradient
      colors={["#0D5B28", "#15803D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.heroTopRow}>
        <Text style={styles.heroLabel}>PROJECTED NET PROFIT</Text>
        <View style={styles.marginBadge}>
          <Text style={styles.marginBadgeText}>
            {forecast.profit_margin_pct}% Margin
          </Text>
        </View>
      </View>

      <Text style={styles.heroValue}>
        Rs. {Math.round(forecast.expected_net_profit_lkr).toLocaleString()}
      </Text>
      <Text style={styles.heroCycleNote}>
        Estimated profit per 60-day picking cycle ({landSize} acres / {treeCount} palms)
      </Text>

      <View style={styles.heroDivider} />

      <View style={styles.heroFooterRow}>
        <View>
          <Text style={styles.heroFooterSub}>Profit / Palm</Text>
          <Text style={styles.heroFooterVal}>
            Rs. {profitPerPalm.toLocaleString()}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.heroFooterSub}>Harvest Cycle</Text>
          <Text style={styles.heroFooterVal}>60 Days (CRI Standard)</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0D5B28",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#D1FAE5",
    letterSpacing: 0.8,
  },
  marginBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  marginBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginVertical: 4,
  },
  heroCycleNote: {
    fontSize: 12,
    color: "#A7F3D0",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 12,
  },
  heroFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroFooterSub: {
    fontSize: 11,
    color: "#A7F3D0",
  },
  heroFooterVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
});
