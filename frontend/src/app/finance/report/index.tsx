import React, { useState } from "react";
import {
  Alert,
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

export default function FinancialReportScreen() {
  const isDark = useColorScheme() === "dark";
  const {
    farmProfile,
    expectedNetProfit,
    expectedRevenue,
    expectedCosts,
    profitMarginPct,
    budgetLimit,
    budgetRemaining,
    totalExpenses,
    totalIncome,
  } = useFinance();

  const [downloaded, setDownloaded] = useState(false);

  function handleDownloadPDF() {
    setDownloaded(true);
    Alert.alert(
      "Financial Report Generated",
      `The executive report for ${farmProfile.plantationName} (${farmProfile.district}) has been compiled with CRI agronomic compliance.`,
      [{ text: "OK", onPress: () => setDownloaded(false) }]
    );
  }

  function handleShare() {
    Alert.alert(
      "Share Financial Report",
      `Sharing executive summary for ${farmProfile.plantationName} (Projected Net Profit: LKR ${Math.round(expectedNetProfit).toLocaleString()}) via system share sheet.`
    );
  }

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
          <Text style={[styles.title, isDark && styles.titleDark]}>Financial Report</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Executive cultivation audit and CRI-standardized financial analysis.
          </Text>
        </View>

        {/* Executive Banner Card */}
        <View style={styles.executiveCard}>
          <View style={styles.execHeaderRow}>
            <View>
              <Text style={styles.execTitle}>{farmProfile.plantationName}</Text>
              <Text style={styles.execSub}>
                {farmProfile.district} | {farmProfile.landSizeAcres} Acres | {farmProfile.treeCount} Palms
              </Text>
            </View>
            <View style={styles.certifiedBadge}>
              <Icon name="check-decagram" size={16} color="#059669" />
              <Text style={styles.certifiedText}>CRI Aligned</Text>
            </View>
          </View>

          <View style={styles.execDivider} />

          <View style={styles.execStatsGrid}>
            <View style={styles.execStatCol}>
              <Text style={styles.execStatLabel}>Net Profit</Text>
              <Text style={styles.execStatVal}>
                LKR {Math.round(expectedNetProfit / 1000)}K
              </Text>
            </View>
            <View style={styles.execStatCol}>
              <Text style={styles.execStatLabel}>Gross Revenue</Text>
              <Text style={styles.execStatVal}>
                LKR {(expectedRevenue / 1000000).toFixed(2)}M
              </Text>
            </View>
            <View style={styles.execStatCol}>
              <Text style={styles.execStatLabel}>Total Costs</Text>
              <Text style={styles.execStatVal}>
                LKR {Math.round(expectedCosts / 1000)}K
              </Text>
            </View>
            <View style={styles.execStatCol}>
              <Text style={styles.execStatLabel}>Profit Margin</Text>
              <Text style={[styles.execStatVal, { color: "#34D399" }]}>
                {profitMarginPct}%
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Summary Breakdown */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Icon name="file-chart-outline" size={20} color="#086B2A" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Harvest Cycle Ledger Overview
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>
              Base Farm-Gate Price:
            </Text>
            <Text style={[styles.summaryBold, isDark && styles.summaryBoldDark]}>
              LKR {farmProfile.basePricePerNut.toFixed(2)} / Nut
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>
              Cultivation Cycle Duration:
            </Text>
            <Text style={[styles.summaryBold, isDark && styles.summaryBoldDark]}>
              60 Days (Standard CRI Pick)
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>
              Recorded Real-Time Expenses:
            </Text>
            <Text style={[styles.summaryBold, { color: "#DC2626" }]}>
              LKR {totalExpenses.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>
              Recorded Crop Income:
            </Text>
            <Text style={[styles.summaryBold, { color: "#059669" }]}>
              LKR {totalIncome.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>
              Cycle Working Capital Limit:
            </Text>
            <Text style={[styles.summaryBold, isDark && styles.summaryBoldDark]}>
              LKR {budgetLimit.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.summaryItem, { borderBottomWidth: 0 }]}>
            <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>
              Remaining Safety Buffer:
            </Text>
            <Text style={[styles.summaryBold, { color: "#086B2A" }]}>
              LKR {budgetRemaining.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* AI Recommendations List */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <Icon name="check-all" size={20} color="#086B2A" />
            <Text style={styles.advisoryTitle}>Key Executive Recommendations</Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#059669" />
            <Text style={styles.bulletText}>
              Maintain farm-gate selling price at or above LKR 125/nut to preserve a 70% profit margin.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#059669" />
            <Text style={styles.bulletText}>
              Apply Adult Palm Mixture (APM) split-dose to avoid nutrient leaching during heavy rains.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check-circle" size={16} color="#059669" />
            <Text style={styles.bulletText}>
              Keep working capital allocations within LKR 400,000 for standard 5-acre monoculture operations.
            </Text>
          </View>
        </View>

        {/* Action Buttons: PDF Download & Share */}
        <Pressable style={styles.downloadButton} onPress={handleDownloadPDF}>
          <Icon name="file-pdf-box" size={22} color="#FFFFFF" />
          <Text style={styles.downloadButtonText}>
            {downloaded ? "Report Ready!" : "Download PDF Report"}
          </Text>
        </Pressable>

        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Icon name="share-variant-outline" size={20} color="#086B2A" />
          <Text style={styles.shareButtonText}>Share Report</Text>
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
  executiveCard: {
    backgroundColor: "#086B2A",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#086B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  execHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  execTitle: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
  execSub: { fontSize: 11, color: "#A7F3D0", marginTop: 2 },
  certifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  certifiedText: { fontSize: 10, fontWeight: "700", color: "#059669" },
  execDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 14,
  },
  execStatsGrid: { flexDirection: "row", justifyContent: "space-between" },
  execStatCol: { alignItems: "flex-start" },
  execStatLabel: { fontSize: 10, color: "#A7F3D0", fontWeight: "600" },
  execStatVal: { fontSize: 15, fontWeight: "900", color: "#FFFFFF", marginTop: 3 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  cardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#153D20" },
  cardTitleDark: { color: "#F3F4F6" },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryText: { fontSize: 12, color: "#4B5563" },
  summaryTextDark: { color: "#D1D5DB" },
  summaryBold: { fontSize: 13, fontWeight: "700", color: "#111827" },
  summaryBoldDark: { color: "#F9FAFB" },
  advisoryCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 20,
  },
  advisoryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  advisoryTitle: { fontSize: 14, fontWeight: "700", color: "#065F46" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginVertical: 4 },
  bulletText: { flex: 1, fontSize: 12, color: "#047857", lineHeight: 17 },
  downloadButton: {
    backgroundColor: "#086B2A",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  downloadButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  shareButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#086B2A",
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  shareButtonText: { color: "#086B2A", fontSize: 15, fontWeight: "700" },
});
