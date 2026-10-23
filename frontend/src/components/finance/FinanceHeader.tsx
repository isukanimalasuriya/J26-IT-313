import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export function FinanceHeader() {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={styles.header}>
      <View style={[styles.badge, isDark && styles.badgeDark]}>
        <Icon name="chart-timeline-variant" size={14} color="#086B2A" />
        <Text style={[styles.badgeText, isDark && styles.badgeTextDark]}>
          CULTIVATION FINANCE
        </Text>
      </View>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Financial Forecasting
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        AI-driven net profit and cultivation cost estimates grounded in CRI agronomic benchmarks.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E2F2E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
    gap: 4,
  },
  badgeDark: {
    backgroundColor: "rgba(8, 107, 42, 0.25)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#086B2A",
    letterSpacing: 0.5,
  },
  badgeTextDark: {
    color: "#34D399",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#153D20",
  },
  titleDark: {
    color: "#ECFDF5",
  },
  subtitle: {
    fontSize: 13,
    color: "#526158",
    marginTop: 4,
    lineHeight: 18,
  },
  subtitleDark: {
    color: "#9CA3AF",
  },
});
