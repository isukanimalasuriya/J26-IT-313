import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  CloudRain,
  CircleDollarSign,
  Info,
  Leaf,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Wind,
} from "lucide-react-native";

const COLORS = {
  background: "#F7F9F8",
  green: "#08752E",
  darkGreen: "#17683A",
  text: "#17211B",
  muted: "#7A8590",
  white: "#FFFFFF",
};

function showSampleNotice(title: string) {
  Alert.alert(
    title,
    "These factors are sample data. Live weather, disease, and market insights are not connected yet.",
  );
}

export default function FactorsInsightsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Leaf color={COLORS.green} size={17} fill={COLORS.green} />
            </View>
            <Text style={styles.brandName}>CocoSmart AI</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => showSampleNotice("Notifications")}
              style={styles.iconButton}
            >
              <Bell color="#7D8993" size={20} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              onPress={() => showSampleNotice("Profile")}
              style={styles.profileButton}
            >
              <UserRound color={COLORS.green} size={20} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to dashboard"
            onPress={() => router.replace("/harvest")}
            style={styles.backButton}
          >
            <ArrowLeft color={COLORS.text} size={22} />
          </Pressable>
          <Text style={styles.title}>Factors &amp; Insights</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="About these insights"
            onPress={() => showSampleNotice("About these insights")}
            style={styles.infoButton}
          >
            <Info color={COLORS.text} size={20} />
          </Pressable>
        </View>

        <View style={[styles.card, styles.weatherCard]}>
          <View style={[styles.iconBox, styles.weatherIconBox]}>
            <CloudRain color="#2468F2" size={23} fill="#2468F2" />
          </View>
          <View style={styles.weatherDetails}>
            <Text style={styles.cardTitle}>Weather Conditions</Text>
            <Text style={styles.weatherSummary}>Moderate Rain Tomorrow</Text>
            <View style={styles.weatherMetrics}>
              <View style={styles.weatherMetric}>
                <Text style={styles.metricLabel}>Temp:</Text>
                <Text style={styles.metricValue}>29°C</Text>
              </View>
              <View style={styles.weatherMetric}>
                <Text style={styles.metricLabel}>Humidity:</Text>
                <Text style={styles.metricValue}>78%</Text>
              </View>
              <View style={styles.weatherMetric}>
                <Wind color="#78838B" size={12} />
                <Text style={styles.metricLabel}>Wind: 12 km/h</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, styles.greenIconBox]}>
            <ShieldCheck color="#13A550" size={22} fill="#13A550" />
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>Disease Status</Text>
            <Text style={styles.cardDescription}>Disease Severity: 18%</Text>
            <Text style={styles.cardFootnote}>[From AI Disease Module]</Text>
          </View>
          <Text style={styles.statusText}>Low Risk</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, styles.greenIconBox]}>
            <CircleDollarSign color="#13A550" size={21} />
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>Market Price</Text>
            <Text style={styles.cardDescription}>
              Current Price: LKR 135.00 / nut
            </Text>
            <View style={styles.trendRow}>
              <Text style={styles.cardDescription}>Trend (4 Weeks):</Text>
              <Text style={styles.trendText}>+5.2%</Text>
              <TrendingUp color="#13A550" size={13} />
            </View>
          </View>
          <Text style={styles.statusText}>High</Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, styles.harvestIconBox]}>
            <CalendarCheck color="#E88A00" size={22} />
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>Previous Harvest History</Text>
            <Text style={styles.cardDescription}>
              Last Harvest: Apr 28, 2025
            </Text>
            <Text style={styles.cardDescription}>
              Days Since Last Harvest: 25 days
            </Text>
            <Text style={styles.recommendation}>
              Recommended Cycle: 25 - 30 days
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => showSampleNotice("Full Insights")}
          style={styles.fullInsightsButton}
        >
          <Text style={styles.fullInsightsText}>View Full Insights</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 17,
    paddingTop: 6,
    paddingBottom: 26,
    gap: 17,
  },
  header: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  logo: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#DCF7E5",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: "#075B25",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.25,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    width: 28,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 4,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EA4B4B",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  profileButton: {
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#20B65A",
    backgroundColor: "#E8F7EC",
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  backButton: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  infoButton: {
    width: 48,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  card: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F0F2F1",
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: "#18271D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  weatherCard: {
    minHeight: 86,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  weatherIconBox: {
    backgroundColor: "#EEF4FF",
  },
  greenIconBox: {
    backgroundColor: "#EFFBF4",
  },
  harvestIconBox: {
    backgroundColor: "#FFF8E8",
  },
  weatherDetails: {
    flex: 1,
    minWidth: 0,
  },
  cardDetails: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: "#253044",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  weatherSummary: {
    color: "#2866E8",
    fontSize: 11,
    marginBottom: 4,
  },
  weatherMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  weatherMetric: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexWrap: "wrap",
  },
  metricLabel: {
    color: "#87919B",
    fontSize: 9,
  },
  metricValue: {
    color: "#7A8590",
    fontSize: 9,
  },
  cardDescription: {
    color: "#7A8590",
    fontSize: 9,
    lineHeight: 14,
  },
  cardFootnote: {
    color: "#9AA4AE",
    fontSize: 9,
    lineHeight: 13,
  },
  statusText: {
    color: "#0DA64C",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 6,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexWrap: "wrap",
  },
  trendText: {
    color: "#0DA64C",
    fontSize: 10,
    fontWeight: "700",
  },
  recommendation: {
    color: "#354151",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  fullInsightsButton: {
    minHeight: 41,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: COLORS.darkGreen,
    marginTop: 1,
    elevation: 3,
    shadowColor: "#153A24",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  fullInsightsText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
