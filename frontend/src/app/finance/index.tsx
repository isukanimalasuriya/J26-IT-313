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

export default function FinancialDashboardScreen() {
  const isDark = useColorScheme() === "dark";
  const {
    farmProfile,
    expectedNetProfit,
    expectedRevenue,
    expectedCosts,
    budgetGap,
  } = useFinance();

  const navMenuItems = [
    {
      title: "View Price Forecast",
      sub: "CDA wholesale & auction trends (1-3 months)",
      icon: "trending-up",
      route: "/finance/price-forecast",
      color: "#059669",
    },
    {
      title: "View Profit Forecast",
      sub: "AI net profit & granular cost breakdown",
      icon: "chart-donut",
      route: "/finance/profit-forecast",
      color: "#10B981",
    },
    {
      title: "View Budget Recommendation",
      sub: "AI-optimized working capital & monthly plan",
      icon: "wallet-outline",
      route: "/finance/budget",
      color: "#F59E0B",
    },
    {
      title: "View Financial Report",
      sub: "Audited plantation executive report & PDF export",
      icon: "file-document-outline",
      route: "/finance/report",
      color: "#3B82F6",
    },
    {
      title: "View Transaction History",
      sub: "Review live recorded expenses and harvest income",
      icon: "format-list-bulleted",
      route: "/finance/transactions",
      color: "#8B5CF6",
    },
    {
      title: "Edit Farm Specifications",
      sub: "Adjust acreage, palm density & farm-gate prices",
      icon: "tune-vertical",
      route: "/finance/edit-farm",
      color: "#6B7280",
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Top Header */}
        <View style={styles.brandRow}>
          <View style={styles.brandTitleWrap}>
            <View style={styles.leafDot} />
            <Text style={[styles.brandTitle, isDark && styles.brandTitleDark]}>
              CocoSmart AI
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/finance/edit-farm" as any)}
            style={styles.settingsIconBtn}
          >
            <Icon name="tune" size={20} color={isDark ? "#D1D5DB" : "#374151"} />
          </Pressable>
        </View>

        {/* Dashboard Title & Plantation Name */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Financial Dashboard
            </Text>
            <View style={styles.updatedBadge}>
              <View style={styles.updatedDot} />
              <Text style={styles.updatedText}>Updated Today</Text>
            </View>
          </View>
          <Text style={[styles.plantationName, isDark && styles.plantationNameDark]}>
            {farmProfile.plantationName} ({farmProfile.district})
          </Text>
        </View>

        {/* Hero Card: Expected Net Profit */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSub}>EXPECTED NET PROFIT</Text>
          <Text style={styles.heroValue}>
            LKR {Math.round(expectedNetProfit).toLocaleString()}
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.gainBadge}>
              <Icon name="arrow-up" size={13} color="#FFFFFF" />
              <Text style={styles.gainBadgeText}>+12.4% vs last cycle</Text>
            </View>
            <Text style={styles.heroCycleText}>
              {farmProfile.landSizeAcres} Acres | {farmProfile.treeCount} Palms
            </Text>
          </View>
        </View>

        {/* Today's Coconut Price Strip Card */}
        <Pressable
          style={[styles.priceStrip, isDark && styles.priceStripDark]}
          onPress={() => router.push("/finance/price-forecast" as any)}
        >
          <View style={styles.priceStripLeft}>
            <Icon name="fruit-cherries" size={22} color="#086B2A" />
            <View>
              <Text style={[styles.priceStripTitle, isDark && styles.priceStripTitleDark]}>
                Today's Coconut Price
              </Text>
              <Text style={styles.priceStripSub}>CDA Wholesale Market</Text>
            </View>
          </View>
          <View style={styles.priceStripRight}>
            <Text style={[styles.priceStripVal, isDark && styles.priceStripValDark]}>
              LKR {farmProfile.basePricePerNut.toFixed(2)}
            </Text>
            <Text style={styles.priceStripUnit}>/ Nut</Text>
          </View>
        </Pressable>

        {/* Financial Summary Grid (4 Cards) */}
        <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>
          Financial Summary (Current 60-Day Cycle)
        </Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
            <Icon name="cash-plus" size={20} color="#059669" />
            <Text style={styles.summaryLabel}>Expected Revenue</Text>
            <Text style={[styles.summaryVal, isDark && styles.summaryValDark]}>
              LKR {(expectedRevenue / 1000000).toFixed(2)}M
            </Text>
          </View>

          <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
            <Icon name="cash-minus" size={20} color="#DC2626" />
            <Text style={styles.summaryLabel}>Expected Costs</Text>
            <Text style={[styles.summaryVal, isDark && styles.summaryValDark]}>
              LKR {Math.round(expectedCosts / 1000)}K
            </Text>
          </View>

          <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
            <Icon name="scale-balance" size={20} color="#F59E0B" />
            <Text style={styles.summaryLabel}>Budget Gap</Text>
            <Text style={[styles.summaryVal, isDark && styles.summaryValDark]}>
              {budgetGap > 0 ? `LKR ${Math.round(budgetGap / 1000)}K` : "LKR 0 (Safe)"}
            </Text>
          </View>

          <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
            <Icon name="shield-check" size={20} color="#10B981" />
            <Text style={styles.summaryLabel}>Financial Risk</Text>
            <Text style={[styles.summaryVal, { color: "#059669" }]}>
              Low (15%)
            </Text>
          </View>
        </View>

        {/* Navigation Action Menu List */}
        <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>
          Financial Planning & Reports
        </Text>
        <View style={styles.menuList}>
          {navMenuItems.map((item) => (
            <Pressable
              key={item.title}
              style={[styles.menuItem, isDark && styles.menuItemDark]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: `${item.color}15` }]}>
                <Icon name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>
                  {item.title}
                </Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>

        {/* Primary CTA Button: Register Financial Transaction */}
        <Pressable
          style={styles.primaryActionButton}
          onPress={() => router.push("/finance/register-transaction" as any)}
        >
          <Icon name="plus-circle" size={20} color="#FFFFFF" />
          <Text style={styles.primaryActionButtonText}>
            Register Financial Transaction
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7FAF7" },
  safeDark: { backgroundColor: "#12141A" },
  scroll: { padding: 16, paddingBottom: 60 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brandTitleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  leafDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#086B2A" },
  brandTitle: { fontSize: 16, fontWeight: "700", color: "#086B2A" },
  brandTitleDark: { color: "#34D399" },
  settingsIconBtn: { padding: 6 },
  header: { marginBottom: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 24, fontWeight: "800", color: "#153D20" },
  titleDark: { color: "#F3F4F6" },
  updatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E2F2E5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  updatedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#059669" },
  updatedText: { fontSize: 10, color: "#086B2A", fontWeight: "700" },
  plantationName: { fontSize: 13, color: "#526158", marginTop: 3 },
  plantationNameDark: { color: "#9CA3AF" },
  heroCard: {
    backgroundColor: "#086B2A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#086B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroSub: { fontSize: 11, color: "#D1FAE5", fontWeight: "700", letterSpacing: 0.5 },
  heroValue: { fontSize: 34, fontWeight: "900", color: "#FFFFFF", marginVertical: 6 },
  heroMetaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  gainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  gainBadgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  heroCycleText: { fontSize: 11, color: "#A7F3D0" },
  priceStrip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5ECE4",
    marginBottom: 20,
  },
  priceStripDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  priceStripLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  priceStripTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  priceStripTitleDark: { color: "#F9FAFB" },
  priceStripSub: { fontSize: 10, color: "#6B7280" },
  priceStripRight: { alignItems: "flex-end" },
  priceStripVal: { fontSize: 16, fontWeight: "900", color: "#086B2A" },
  priceStripValDark: { color: "#34D399" },
  priceStripUnit: { fontSize: 10, color: "#6B7280" },
  sectionHeading: { fontSize: 15, fontWeight: "700", color: "#153D20", marginBottom: 10 },
  sectionHeadingDark: { color: "#F3F4F6" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  summaryCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  summaryLabel: { fontSize: 11, color: "#6B7280", marginTop: 6 },
  summaryVal: { fontSize: 16, fontWeight: "800", color: "#111827", marginVertical: 2 },
  summaryValDark: { color: "#F9FAFB" },
  menuList: { gap: 10, marginBottom: 24 },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  menuItemDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  menuIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  menuTextWrap: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  menuTitleDark: { color: "#F9FAFB" },
  menuSub: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  primaryActionButton: {
    backgroundColor: "#086B2A",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#086B2A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
