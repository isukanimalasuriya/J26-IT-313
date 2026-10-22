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

export default function PriceForecastScreen() {
  const isDark = useColorScheme() === "dark";
  const { farmProfile } = useFinance();

  const currentPrice = farmProfile.basePricePerNut;
  const price1m = Math.round(currentPrice * 1.05);
  const price2m = Math.round(currentPrice * 1.155);
  const price3m = Math.round(currentPrice * 1.26);

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Navigation Bar */}
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
          <Text style={[styles.title, isDark && styles.titleDark]}>Price Forecast</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Predicting future market prices for your upcoming harvest cycle in {farmProfile.district}.
          </Text>
        </View>

        {/* Today's Expected Price Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroSub}>Today's Expected Price</Text>
            <View style={styles.trendBadge}>
              <Icon name="trending-up" size={14} color="#059669" />
              <Text style={styles.trendBadgeText}>+3.2% this week</Text>
            </View>
          </View>
          <Text style={styles.heroPrice}>LKR {currentPrice.toFixed(2)}</Text>
          <Text style={styles.heroPerNut}>/ Nut (CDA Colombo Auction Benchmark)</Text>
        </View>

        {/* 3-Month Projection Cards */}
        <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>
          Price Forecast (Upcoming Quarters)
        </Text>
        <View style={styles.forecastRow}>
          <View style={[styles.forecastCard, isDark && styles.forecastCardDark]}>
            <Text style={styles.forecastTime}>1 Month</Text>
            <Text style={[styles.forecastVal, isDark && styles.forecastValDark]}>
              LKR {price1m}
            </Text>
            <Text style={styles.forecastGain}>+5%</Text>
          </View>

          <View style={[styles.forecastCard, styles.forecastCardActive, isDark && styles.forecastCardActiveDark]}>
            <Text style={[styles.forecastTime, styles.forecastTimeActive]}>2 Months</Text>
            <Text style={[styles.forecastVal, styles.forecastValActive]}>
              LKR {price2m}
            </Text>
            <Text style={styles.forecastGain}>+15%</Text>
          </View>

          <View style={[styles.forecastCard, isDark && styles.forecastCardDark]}>
            <Text style={styles.forecastTime}>3 Months</Text>
            <Text style={[styles.forecastVal, isDark && styles.forecastValDark]}>
              LKR {price3m}
            </Text>
            <Text style={styles.forecastGain}>+26%</Text>
          </View>
        </View>

        {/* Price Trend Projection Visual Bar/Graph */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeaderRow}>
            <Icon name="chart-bell-curve-cumulative" size={20} color="#086B2A" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Price Trend Projection
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              <View style={styles.barCol}>
                <Text style={styles.barPriceText}>LKR {Math.round(currentPrice * 0.94)}</Text>
                <View style={[styles.barPillar, { height: 60, backgroundColor: "#D1D5DB" }]} />
                <Text style={styles.barLabel}>June</Text>
                <Text style={styles.barSub}>Hist.</Text>
              </View>

              <View style={styles.barCol}>
                <Text style={styles.barPriceText}>LKR {Math.round(currentPrice * 0.97)}</Text>
                <View style={[styles.barPillar, { height: 75, backgroundColor: "#9CA3AF" }]} />
                <Text style={styles.barLabel}>July</Text>
                <Text style={styles.barSub}>Hist.</Text>
              </View>

              <View style={styles.barCol}>
                <Text style={[styles.barPriceText, { color: "#059669", fontWeight: "700" }]}>
                  LKR {Math.round(currentPrice)}
                </Text>
                <View style={[styles.barPillar, { height: 95, backgroundColor: "#059669" }]} />
                <Text style={[styles.barLabel, { color: "#059669", fontWeight: "700" }]}>Now</Text>
                <Text style={styles.barSub}>Today</Text>
              </View>

              <View style={styles.barCol}>
                <Text style={[styles.barPriceText, { color: "#10B981" }]}>LKR {price1m}</Text>
                <View style={[styles.barPillar, { height: 110, backgroundColor: "#10B981" }]} />
                <Text style={styles.barLabel}>Sep</Text>
                <Text style={styles.barSub}>Pred.</Text>
              </View>

              <View style={styles.barCol}>
                <Text style={[styles.barPriceText, { color: "#086B2A", fontWeight: "800" }]}>
                  LKR {price2m}
                </Text>
                <View style={[styles.barPillar, { height: 130, backgroundColor: "#086B2A" }]} />
                <Text style={[styles.barLabel, { color: "#086B2A", fontWeight: "800" }]}>Oct</Text>
                <Text style={styles.barSub}>Peak</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#9CA3AF" }]} />
                <Text style={styles.legendText}>Historical CDA Auction</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#086B2A" }]} />
                <Text style={styles.legendText}>AI Forecast</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Factors Affecting Price Grid */}
        <Text style={[styles.sectionHeading, isDark && styles.sectionHeadingDark]}>
          Factors Affecting Price
        </Text>
        <View style={styles.factorsGrid}>
          <View style={[styles.factorCard, isDark && styles.factorCardDark]}>
            <Icon name="weather-partly-cloudy" size={20} color="#059669" />
            <Text style={styles.factorLabel}>Weather Deficit</Text>
            <Text style={styles.factorValue}>Favourable</Text>
          </View>

          <View style={[styles.factorCard, isDark && styles.factorCardDark]}>
            <Icon name="tree" size={20} color="#059669" />
            <Text style={styles.factorLabel}>Tree Health Status</Text>
            <Text style={styles.factorValue}>Healthy (Zone A)</Text>
          </View>

          <View style={[styles.factorCard, isDark && styles.factorCardDark]}>
            <Icon name="chart-line-variant" size={20} color="#059669" />
            <Text style={styles.factorLabel}>Market Demand</Text>
            <Text style={styles.factorValue}>Increasing</Text>
          </View>

          <View style={[styles.factorCard, isDark && styles.factorCardDark]}>
            <Icon name="shield-check" size={20} color="#059669" />
            <Text style={styles.factorLabel}>Prediction Confidence</Text>
            <Text style={styles.factorValue}>92% Confidence</Text>
          </View>
        </View>

        {/* Best Time to Sell Advisory Box */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <Icon name="calendar-check" size={22} color="#086B2A" />
            <Text style={styles.advisoryTitle}>Best Time to Sell</Text>
          </View>
          <Text style={styles.advisoryWindow}>1 October – 20 October</Text>
          <Text style={styles.advisoryDetail}>
            Peak market window with expected price range of <Text style={{ fontWeight: "700" }}>LKR {price2m} – {price3m}</Text> per nut.
          </Text>
        </View>

        {/* Bottom CTA Button */}
        <Pressable
          style={styles.continueButton}
          onPress={() => router.push("/finance/profit-forecast" as any)}
        >
          <Text style={styles.continueButtonText}>Continue to Profit Forecast</Text>
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
  brandTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leafDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#086B2A",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#086B2A",
  },
  brandTitleDark: { color: "#34D399" },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#153D20" },
  titleDark: { color: "#F3F4F6" },
  subtitle: { fontSize: 13, color: "#526158", marginTop: 4, lineHeight: 18 },
  subtitleDark: { color: "#9CA3AF" },
  heroCard: {
    backgroundColor: "#086B2A",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#086B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroSub: { fontSize: 12, color: "#D1FAE5", fontWeight: "600" },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trendBadgeText: { fontSize: 11, fontWeight: "700", color: "#059669" },
  heroPrice: { fontSize: 34, fontWeight: "900", color: "#FFFFFF", marginTop: 8 },
  heroPerNut: { fontSize: 12, color: "#A7F3D0", marginTop: 2 },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#153D20",
    marginBottom: 10,
  },
  sectionHeadingDark: { color: "#F3F4F6" },
  forecastRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5ECE4",
    alignItems: "center",
  },
  forecastCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  forecastCardActive: {
    backgroundColor: "#EBF5ED",
    borderColor: "#086B2A",
  },
  forecastCardActiveDark: {
    backgroundColor: "rgba(8, 107, 42, 0.25)",
    borderColor: "#10B981",
  },
  forecastTime: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  forecastTimeActive: { color: "#086B2A", fontWeight: "700" },
  forecastVal: { fontSize: 15, fontWeight: "800", color: "#111827", marginVertical: 4 },
  forecastValDark: { color: "#F9FAFB" },
  forecastValActive: { color: "#086B2A" },
  forecastGain: { fontSize: 11, color: "#059669", fontWeight: "700" },
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
  chartContainer: { alignItems: "center" },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    height: 160,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  barCol: { alignItems: "center", flex: 1 },
  barPriceText: { fontSize: 9, color: "#6B7280", marginBottom: 4 },
  barPillar: { width: 22, borderRadius: 4 },
  barLabel: { fontSize: 11, color: "#374151", marginTop: 6, fontWeight: "600" },
  barSub: { fontSize: 9, color: "#9CA3AF" },
  legendRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: "#6B7280" },
  factorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  factorCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  factorCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  factorLabel: { fontSize: 11, color: "#6B7280", marginTop: 6 },
  factorValue: { fontSize: 13, fontWeight: "700", color: "#059669", marginTop: 2 },
  advisoryCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 24,
  },
  advisoryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  advisoryTitle: { fontSize: 14, fontWeight: "700", color: "#065F46" },
  advisoryWindow: { fontSize: 18, fontWeight: "800", color: "#086B2A", marginVertical: 4 },
  advisoryDetail: { fontSize: 12, color: "#047857", lineHeight: 18 },
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
