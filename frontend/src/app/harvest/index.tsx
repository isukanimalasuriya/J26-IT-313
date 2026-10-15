import { useWindowDimensions } from "react-native";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  CalendarCheck,
  Camera,
  ChartNoAxesCombined,
  CircleCheck,
  FileText,
  Leaf,
  Target,
  TreeDeciduous,
  UserRound,
} from "lucide-react-native";

const COLORS = {
  background: "#F7F9F8",
  green: "#08752E",
  darkGreen: "#17683A",
  text: "#17211B",
  muted: "#7A8590",
  border: "#E8EEEA",
  white: "#FFFFFF",
};

const stats = [
  { label: "Total Trees", value: "248", detail: "+12 this month", Icon: TreeDeciduous },
  { label: "Coconuts Analyzed", value: "186", detail: "Today", Icon: CircleCheck },
  { label: "AI Confidence", value: "92%", detail: "Sample only", Icon: Target },
  { label: "This Week", value: "12", detail: "Analyses", Icon: CalendarCheck },
];

const actions = [
  { label: "Analyze Image", Icon: Camera },
  { label: "Harvest Predicted", Icon: CalendarCheck },
  { label: "Factors & Insights", Icon: ChartNoAxesCombined },
  { label: "Reports", Icon: FileText },
];

const trees = [
  { id: "Tree C023", farm: "Green Valley Farm", color: "#28C76F" },
  { id: "Tree C024", farm: "Green Valley Farm", color: "#F4B740" },
  { id: "Tree C025", farm: "Green Valley Farm", color: "#8C5CFF" },
];

function showPreviewMessage(feature: string) {
  Alert.alert(
    feature,
    "This dashboard is a UI preview. Scanning, harvest estimates, and live AI services are not connected yet.",
  );
}

export default function HarvestDashboard() {
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 360 ? 16 : 24;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Leaf color={COLORS.green} size={20} fill={COLORS.green} />
            </View>
            <Text style={styles.brandName}>CocoSmart AI</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => showPreviewMessage("Notifications")}
              style={styles.iconButton}
            >
              <Bell color="#7D8993" size={21} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              onPress={() => showPreviewMessage("Profile")}
              style={styles.profileButton}
            >
              <UserRound color={COLORS.green} size={21} />
            </Pressable>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>Harvest Dashboard</Text>
          <Text style={styles.greeting}>Welcome, Jenny! 👋</Text>
          <Text style={styles.tagline}>Smart solutions for better harvests.</Text>
        </View>

        <View style={styles.harvestCard}>
          <View style={styles.harvestSummary}>
            <Text style={styles.harvestLabel}>Ready to Harvest</Text>
            <Text style={styles.harvestValue}>56</Text>
            <Text style={styles.harvestCaption}>Sample estimate · not live AI</Text>
          </View>
          <Image
            source={require("@/assets/images/coconut-farm.jpg")}
            style={styles.harvestImage}
            resizeMode="cover"
            accessibilityLabel="Coconut palms at a tropical farm"
          />
        </View>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Farm Statistics</Text>
          <Text style={styles.sampleTag}>SAMPLE DATA</Text>
        </View>
        <View style={styles.statsRow}>
          {stats.map(({ label, value, detail, Icon }) => (
            <View key={label} style={styles.statCard}>
              <Icon color="#14A44D" size={19} strokeWidth={2.6} />
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statDetail}>{detail}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {actions.map(({ label, Icon }) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              onPress={() => showPreviewMessage(label)}
              style={styles.action}
            >
              <View style={styles.actionIcon}>
                <Icon color="#11833B" size={21} strokeWidth={2.6} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.treesHeading}>
          <Text style={styles.sectionTitle}>My Trees</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => showPreviewMessage("My Trees")}
            hitSlop={8}
          >
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>
        <View style={styles.treeList}>
          {trees.map((tree) => (
            <View key={tree.id} style={styles.treeCard}>
              <View style={[styles.treeDot, { backgroundColor: tree.color }]} />
              <View style={styles.treeInfo}>
                <Text style={styles.treeName}>{tree.id}</Text>
                <Text style={styles.treeFarm}>{tree.farm}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Scan ${tree.id}`}
                onPress={() => showPreviewMessage("Tree scanning")}
                style={styles.scanButton}
              >
                <Text style={styles.scanButtonText}>Scan</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteText}>
            Figures shown are sample data. No live harvesting or AI predictions
            are connected.
          </Text>
        </View>
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
    paddingTop: 8,
    paddingBottom: 28,
  },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DCF7E5",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: "#075B25",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.35,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  iconButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EA4B4B",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#20B65A",
    backgroundColor: "#E8F7EC",
    alignItems: "center",
    justifyContent: "center",
  },
  welcome: {
    marginTop: 11,
    marginBottom: 23,
  },
  eyebrow: {
    color: "#65736B",
    fontSize: 14,
    marginBottom: 5,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  tagline: {
    color: "#9AA5AE",
    fontSize: 12,
    marginTop: 4,
  },
  harvestCard: {
    height: 148,
    overflow: "hidden",
    borderRadius: 24,
    flexDirection: "row",
    backgroundColor: COLORS.darkGreen,
    marginBottom: 23,
    elevation: 4,
    shadowColor: "#153A24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  harvestSummary: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: COLORS.darkGreen,
  },
  harvestLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  harvestValue: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 54,
  },
  harvestCaption: {
    color: "#C5E1D0",
    fontSize: 10,
    marginTop: 2,
  },
  harvestImage: {
    flex: 1,
    height: "100%",
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sampleTag: {
    color: COLORS.green,
    backgroundColor: "#E7F5EB",
    overflow: "hidden",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 135,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F0F2F1",
    elevation: 1,
    shadowColor: "#18271D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  statLabel: {
    minHeight: 30,
    marginTop: 9,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  statValue: {
    color: "#171C19",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 1,
  },
  statDetail: {
    color: "#78A987",
    fontSize: 9,
    lineHeight: 12,
    marginTop: 2,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    marginTop: 12,
    marginBottom: 17,
  },
  action: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F0F2F1",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#18271D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  actionLabel: {
    minHeight: 30,
    marginTop: 8,
    color: "#59656D",
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  treesHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewAll: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "700",
  },
  treeList: {
    gap: 9,
  },
  treeCard: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    backgroundColor: COLORS.white,
  },
  treeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  treeInfo: {
    flex: 1,
  },
  treeName: {
    color: "#222B25",
    fontSize: 14,
    fontWeight: "600",
  },
  treeFarm: {
    color: "#78857D",
    fontSize: 11,
    marginTop: 2,
  },
  scanButton: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingHorizontal: 17,
    paddingVertical: 7,
    backgroundColor: "#086B2A",
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  bottomNote: {
    marginTop: 14,
    alignItems: "center",
  },
  bottomNoteText: {
    color: "#88938C",
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
});
