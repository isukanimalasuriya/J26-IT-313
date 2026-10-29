import React from "react";
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
import { router } from "expo-router";
import { useFinance } from "@/context/FinanceContext";

export default function ProfitForecastScreen() {
  const isDark = useColorScheme() === "dark";
  const {
    expectedNetProfit,
    expectedRevenue,
    expectedCosts,
    profitMarginPct,
    profitBreakdown,
  } = useFinance();

  const totalCost = expectedCosts || 1;
  const breakdownList = [
    {
      name: "Labor Cost",
      sub: "Harvesting & Maintenance",
      amount: profitBreakdown.labor,
      color: "#059669",
      icon: "account-group",
    },
    {
      name: "Fertilizer Cost",
      sub: "APM Mixture & Application",
      amount: profitBreakdown.fertilizer,
      color: "#F59E0B",
      icon: "sprout",
    },
    {
      name: "Irrigation Cost",
      sub: "Basin & Drip System Energy",
      amount: profitBreakdown.irrigation,
      color: "#3B82F6",
      icon: "water-pump",
    },
    {
      name: "Disease Treatment",
      sub: "Prevention & Trap Maintenance",
      amount: profitBreakdown.disease,
      color: "#8B5CF6",
      icon: "shield-bug",
    },
    {
      name: "Other Expenses",
      sub: "Logistics, Climbing & Buffer",
      amount: profitBreakdown.other,
      color: "#6B7280",
      icon: "dolly",
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={isDark ? "#FFFFFF" : "#111827"} />
          </Pressable>
          <View style={styles.brandTitleWrap}>
            <View style={styles.leafDot} />
            <Text style={[styles.brandTitle, isDark && styles.brandTitleDark]}>
              CocoSmart AI
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Profit Forecast</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Projected net profit and detailed expense breakdown for the upcoming picking cycle.
          </Text>
        </View>

        {/* Hero Card: Net Profit */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSub}>EXPECTED NET PROFIT</Text>
          <Text style={styles.heroValue}>
            LKR {Math.round(expectedNetProfit).toLocaleString()}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.gainBadge}>
              <Icon name="arrow-up" size={13} color="#FFFFFF" />
              <Text style={styles.gainBadgeText}>+12.4% vs last period</Text>
            </View>
            <Text style={styles.cycleLabel}>Standard 60-day cycle</Text>
          </View>
        </View>

        {/* Revenue vs Cost Row */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
            <Text style={styles.summaryLabel}>EXPECTED REVENUE</Text>
            <Text style={[styles.summaryValue, { color: "#059669" }]}>
              LKR {(expectedRevenue / 1000000).toFixed(2)}M
            </Text>
            <Text style={styles.summarySub}>Estimated Pick</Text>
          </View>

          <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
            <Text style={styles.summaryLabel}>TOTAL CULTIVATION COST</Text>
            <Text style={[styles.summaryValue, { color: "#DC2626" }]}>
              LKR {Math.round(expectedCosts / 1000)}K
            </Text>
            <Text style={styles.summarySub}>CRI Norms</Text>
          </View>
        </View>

        {/* Profit Breakdown Section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Icon name="chart-pie" size={20} color="#086B2A" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Expense Breakdown
            </Text>
          </View>

          {/* Visual Donut Ring Segment Representation */}
          <View style={styles.donutWrapper}>
            <View style={styles.donutRing}>
              <Text style={styles.donutCenterSub}>Total Cost</Text>
              <Text style={styles.donutCenterVal}>
                LKR {Math.round(expectedCosts / 1000)}K
              </Text>
            </View>
          </View>

          {/* Breakdown Items List */}
          {breakdownList.map((item) => {
            const pct = Math.round((item.amount / totalCost) * 100);
            return (
              <View key={item.name} style={styles.breakdownRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={styles.breakdownDetails}>
                  <Text style={[styles.breakdownName, isDark && styles.breakdownNameDark]}>
                    {item.name}
                  </Text>
                  <Text style={styles.breakdownSub}>{item.sub}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.min(100, Math.max(3, pct))}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={[styles.breakdownAmount, isDark && styles.breakdownAmountDark]}>
                    LKR {Math.round(item.amount).toLocaleString()}
                  </Text>
                  <Text style={styles.breakdownPct}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Profit Margin Gauge Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Icon name="gauge" size={20} color="#086B2A" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Profit Margin Health
            </Text>
          </View>
          <View style={styles.marginRow}>
            <View style={styles.circleGauge}>
              <Text style={styles.marginPercent}>{profitMarginPct}%</Text>
              <Text style={styles.marginTextSub}>Net Margin</Text>
            </View>
            <View style={styles.marginAdvice}>
              <Text style={[styles.marginAdviceTitle, isDark && styles.marginAdviceTitleDark]}>
                Excellent Operational Return
              </Text>
              <Text style={styles.marginAdviceBody}>
                Your plantation is operating at a robust {profitMarginPct}% profit margin, well above the island average (52%).
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom CTA Button */}
        <Pressable
          style={styles.continueButton}
          onPress={() => router.push("/finance/budget" as any)}
        >
          <Text style={styles.continueButtonText}>Continue to Budget Recommendation</Text>
          <Icon name="arrow-right" size={20} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7FAF7" },
  safeDark: { backgroundColor: "#12141A" },
  scroll: { padding: 16, paddingBottom: 50 },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  brandTitleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  leafDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#086B2A" },
  brandTitle: { fontSize: 16, fontWeight: "700", color: "#086B2A" },
  brandTitleDark: { color: "#34D399" },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#153D20" },
  titleDark: { color: "#F3F4F6" },
  subtitle: { fontSize: 13, color: "#526158", marginTop: 4, lineHeight: 18 },
  subtitleDark: { color: "#9CA3AF" },
  heroCard: {
    backgroundColor: "#086B2A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#086B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroSub: { fontSize: 12, color: "#D1FAE5", fontWeight: "700", letterSpacing: 0.5 },
  heroValue: { fontSize: 34, fontWeight: "900", color: "#FFFFFF", marginVertical: 6 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  gainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  gainBadgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  cycleLabel: { fontSize: 11, color: "#A7F3D0" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  summaryCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  summaryLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", letterSpacing: 0.4 },
  summaryValue: { fontSize: 18, fontWeight: "800", marginVertical: 4 },
  summarySub: { fontSize: 10, color: "#9CA3AF" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  cardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#153D20" },
  cardTitleDark: { color: "#F3F4F6" },
  donutWrapper: { alignItems: "center", marginVertical: 10 },
  donutRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: "#086B2A",
    borderTopColor: "#F59E0B",
    borderRightColor: "#3B82F6",
    borderBottomColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenterSub: { fontSize: 10, color: "#6B7280" },
  donutCenterVal: { fontSize: 14, fontWeight: "800", color: "#111827", marginTop: 2 },
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 8 },
  iconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  breakdownDetails: { flex: 1 },
  breakdownName: { fontSize: 13, fontWeight: "700", color: "#1F2937" },
  breakdownNameDark: { color: "#F9FAFB" },
  breakdownSub: { fontSize: 10, color: "#6B7280", marginTop: 1 },
  barTrack: { height: 5, backgroundColor: "#E5E7EB", borderRadius: 3, marginTop: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  breakdownRight: { alignItems: "flex-end" },
  breakdownAmount: { fontSize: 13, fontWeight: "700", color: "#111827" },
  breakdownAmountDark: { color: "#F9FAFB" },
  breakdownPct: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  marginRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  circleGauge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    borderColor: "#086B2A",
    alignItems: "center",
    justifyContent: "center",
  },
  marginPercent: { fontSize: 20, fontWeight: "900", color: "#086B2A" },
  marginTextSub: { fontSize: 9, color: "#6B7280" },
  marginAdvice: { flex: 1 },
  marginAdviceTitle: { fontSize: 13, fontWeight: "700", color: "#153D20" },
  marginAdviceTitleDark: { color: "#F9FAFB" },
  marginAdviceBody: { fontSize: 11, color: "#526158", marginTop: 3, lineHeight: 16 },
  continueButton: {
    backgroundColor: "#086B2A",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
