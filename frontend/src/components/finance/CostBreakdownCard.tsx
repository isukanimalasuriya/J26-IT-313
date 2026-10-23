import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { CostBreakdown } from "./types";

interface Props {
  costBreakdown: CostBreakdown;
  totalCost: number;
}

export function CostBreakdownCard({ costBreakdown, totalCost }: Props) {
  const isDark = useColorScheme() === "dark";
  const validTotal = totalCost > 0 ? totalCost : 1;

  const items = [
    {
      name: "Fertilizer (APM Mixture)",
      amount: costBreakdown.fertilizer_cost_lkr,
      color: "#059669",
    },
    {
      name: "Labor & Application",
      amount: costBreakdown.labor_cost_lkr,
      color: "#3B82F6",
    },
    {
      name: "Harvesting & Climbing",
      amount: costBreakdown.harvesting_cost_lkr,
      color: "#F59E0B",
    },
    {
      name: "Weeding & Farm Maintenance",
      amount: costBreakdown.maintenance_cost_lkr,
      color: "#6B7280",
    },
  ];

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardHeaderRow}>
        <Icon name="chart-pie" size={20} color="#086B2A" />
        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
          Cost Breakdown (per 60-day cycle)
        </Text>
      </View>

      {items.map((item) => {
        const percent = Math.round((item.amount / validTotal) * 100);
        return (
          <View key={item.name} style={styles.costItem}>
            <View style={styles.costHeader}>
              <Text style={[styles.costName, isDark && styles.costNameDark]}>
                {item.name}
              </Text>
              <Text style={[styles.costAmount, isDark && styles.costAmountDark]}>
                Rs. {Math.round(item.amount).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.costBarTrack, isDark && styles.costBarTrackDark]}>
              <View
                style={[
                  styles.costBarFill,
                  {
                    width: `${Math.min(100, Math.max(2, percent))}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.costPercent}>{percent}% of total cost</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5ECE4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#1E222A",
    borderColor: "#2D3440",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#153D20",
  },
  cardTitleDark: {
    color: "#F3F4F6",
  },
  costItem: {
    marginBottom: 12,
  },
  costHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  costName: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  costNameDark: {
    color: "#D1D5DB",
  },
  costAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  costAmountDark: {
    color: "#F9FAFB",
  },
  costBarTrack: {
    height: 7,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 2,
  },
  costBarTrackDark: {
    backgroundColor: "#374151",
  },
  costBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  costPercent: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 2,
  },
});
