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

export default function BudgetRecommendationScreen() {
  const isDark = useColorScheme() === "dark";
  const {
    budgetLimit,
    totalExpenses,
    budgetRemaining,
    budgetSpentPercentage,
    budgetAllocations,
  } = useFinance();

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Nav */}
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
          <Text style={[styles.title, isDark && styles.titleDark]}>Budget Recommendation</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            AI-driven recommended working capital allocation for your next 60-day picking cycle.
          </Text>
        </View>

        {/* Hero Card: Recommended Budget */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSub}>RECOMMENDED BUDGET FOR NEXT CYCLE</Text>
          <Text style={styles.heroValue}>
            LKR {budgetLimit.toLocaleString()}
          </Text>
          <Text style={styles.heroDesc}>
            Optimal working capital calculated from CRI agronomic density and current market wages.
          </Text>
        </View>

        {/* Budget Usage Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Icon name="progress-clock" size={20} color="#086B2A" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Budget Usage Status
            </Text>
          </View>

          <View style={styles.usageRow}>
            <View>
              <Text style={styles.usageLabel}>Spent so far</Text>
              <Text style={[styles.usageVal, { color: "#DC2626" }]}>
                LKR {totalExpenses.toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.usageLabel}>Remaining</Text>
              <Text style={[styles.usageVal, { color: "#059669" }]}>
                LKR {budgetRemaining.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.usageTrack}>
            <View
              style={[
                styles.usageFill,
                {
                  width: `${budgetSpentPercentage}%`,
                  backgroundColor: budgetSpentPercentage > 85 ? "#DC2626" : "#086B2A",
                },
              ]}
            />
          </View>
          <Text style={styles.usagePctText}>
            {budgetSpentPercentage}% of cycle budget utilized
          </Text>
        </View>

        {/* Upcoming Allocations Row */}
        <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>
          Upcoming Target Allocations
        </Text>
        <View style={styles.allocRow}>
          <View style={[styles.allocCard, isDark && styles.allocCardDark]}>
            <Icon name="sprout" size={22} color="#059669" />
            <Text style={styles.allocLabel}>Fertilizer Budget</Text>
            <Text style={[styles.allocVal, isDark && styles.allocValDark]}>
              LKR 124,000
            </Text>
            <Text style={styles.allocSub}>CRI APM 2nd Dose</Text>
          </View>

          <View style={[styles.allocCard, isDark && styles.allocCardDark]}>
            <Icon name="water-pump" size={22} color="#3B82F6" />
            <Text style={styles.allocLabel}>Irrigation Budget</Text>
            <Text style={[styles.allocVal, isDark && styles.allocValDark]}>
              LKR 54,000
            </Text>
            <Text style={styles.allocSub}>Dry spell contingency</Text>
          </View>
        </View>

        {/* Budget Allocation Breakdown */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Icon name="chart-arc" size={20} color="#086B2A" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Category Allocation Breakdown
            </Text>
          </View>

          {budgetAllocations.map((item) => (
            <View key={item.category} style={styles.breakdownRow}>
              <View style={[styles.colorSquare, { backgroundColor: item.color }]} />
              <Text style={[styles.categoryName, isDark && styles.categoryNameDark]}>
                {item.category}
              </Text>
              <Text style={styles.categoryPct}>{item.percentage}%</Text>
              <Text style={[styles.categoryAmount, isDark && styles.categoryAmountDark]}>
                LKR {Math.round(item.amount).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* AI Recommendations Card */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <Icon name="robot" size={20} color="#086B2A" />
            <Text style={styles.advisoryTitle}>AI Budget Insights</Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#059669" />
            <Text style={styles.bulletText}>
              Prioritize organic mulch and fertilizer ring trenching before inter-monsoon rains.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#059669" />
            <Text style={styles.bulletText}>
              Reserve at least LKR 50,000 for dry weather irrigation if rainfall drops below 75mm.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#059669" />
            <Text style={styles.bulletText}>
              Current spending rate is healthy and well within safe limits.
            </Text>
          </View>
        </View>

        {/* Spending Thresholds */}
        <View style={styles.thresholdRow}>
          <View style={[styles.thresholdCard, { borderColor: "#A7F3D0" }]}>
            <Text style={styles.thresholdLabel}>Safe Spending Limit</Text>
            <Text style={[styles.thresholdVal, { color: "#059669" }]}>LKR 85,000</Text>
          </View>
          <View style={[styles.thresholdCard, { borderColor: "#FCD34D" }]}>
            <Text style={styles.thresholdLabel}>Warning Threshold</Text>
            <Text style={[styles.thresholdVal, { color: "#D97706" }]}>LKR 100,000</Text>
          </View>
        </View>

        {/* Monthly Budget Roadmap */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Icon name="timeline-text" size={20} color="#086B2A" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Monthly Budget Timeline
            </Text>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: "#086B2A" }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineMonth, isDark && styles.timelineMonthDark]}>
                Month 1 (Days 1–30)
              </Text>
              <Text style={styles.timelineDesc}>Fertilizer Application & Soil Ring Weeding</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: "#3B82F6" }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineMonth, isDark && styles.timelineMonthDark]}>
                Month 2 (Days 31–50)
              </Text>
              <Text style={styles.timelineDesc}>Drip Irrigation & Pest Trap Inspection</Text>
            </View>
          </View>

          <View style={[styles.timelineItem, { borderLeftWidth: 0 }]}>
            <View style={[styles.timelineDot, { backgroundColor: "#F59E0B" }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineMonth, isDark && styles.timelineMonthDark]}>
                Harvest Window (Days 50–60)
              </Text>
              <Text style={styles.timelineDesc}>Climbing, Sorting & CDA Farm-Gate Auction Pick</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/finance/register-transaction" as any)}
        >
          <Icon name="plus-circle" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Register New Transaction</Text>
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
  heroSub: { fontSize: 11, color: "#D1FAE5", fontWeight: "700", letterSpacing: 0.5 },
  heroValue: { fontSize: 34, fontWeight: "900", color: "#FFFFFF", marginVertical: 6 },
  heroDesc: { fontSize: 12, color: "#A7F3D0", lineHeight: 17 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  cardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#153D20" },
  cardTitleDark: { color: "#F3F4F6" },
  usageRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  usageLabel: { fontSize: 11, color: "#6B7280" },
  usageVal: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  usageTrack: { height: 10, backgroundColor: "#E5E7EB", borderRadius: 5, overflow: "hidden", marginVertical: 4 },
  usageFill: { height: "100%", borderRadius: 5 },
  usagePctText: { fontSize: 11, color: "#6B7280", marginTop: 4, textAlign: "right" },
  sectionHeading: { fontSize: 15, fontWeight: "700", color: "#153D20", marginBottom: 10 },
  sectionHeadingDark: { color: "#F3F4F6" },
  allocRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  allocCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  allocCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  allocLabel: { fontSize: 11, color: "#6B7280", marginTop: 6 },
  allocVal: { fontSize: 16, fontWeight: "800", color: "#111827", marginVertical: 2 },
  allocValDark: { color: "#F9FAFB" },
  allocSub: { fontSize: 10, color: "#9CA3AF" },
  breakdownRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  colorSquare: { width: 10, height: 10, borderRadius: 2, marginRight: 8 },
  categoryName: { flex: 1, fontSize: 13, color: "#374151", fontWeight: "600" },
  categoryNameDark: { color: "#E5E7EB" },
  categoryPct: { fontSize: 12, color: "#6B7280", marginRight: 12 },
  categoryAmount: { fontSize: 13, fontWeight: "700", color: "#111827" },
  categoryAmountDark: { color: "#F9FAFB" },
  advisoryCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 16,
  },
  advisoryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  advisoryTitle: { fontSize: 14, fontWeight: "700", color: "#065F46" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginVertical: 4 },
  bulletText: { flex: 1, fontSize: 12, color: "#047857", lineHeight: 17 },
  thresholdRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  thresholdCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  thresholdLabel: { fontSize: 11, color: "#6B7280" },
  thresholdVal: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 6,
    paddingBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: "#E5E7EB",
    marginLeft: 6,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -7,
    marginRight: 10,
    marginTop: 2,
  },
  timelineContent: { flex: 1 },
  timelineMonth: { fontSize: 13, fontWeight: "700", color: "#111827" },
  timelineMonthDark: { color: "#F9FAFB" },
  timelineDesc: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  actionButton: {
    backgroundColor: "#086B2A",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
