import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell, Camera, CalendarCheck, Check, ChevronDown, CircleAlert, Leaf, MapPin, Search, SlidersHorizontal } from "lucide-react-native";

type Status = "Healthy" | "Under Treatment" | "Critical";
type Tree = { id: string; plot: string; disease: string; scan: string; status: Status };

const trees: Tree[] = [
  { id: "#33", plot: "Hambantota Plot C", disease: "No symptoms", scan: "40 days ago", status: "Healthy" },
  { id: "#21", plot: "Hambantota Plot C", disease: "No symptoms", scan: "22 days ago", status: "Healthy" },
  { id: "#04", plot: "Beliatta Section 2", disease: "Coconut Mite", scan: "14 days ago", status: "Under Treatment" },
  { id: "#09", plot: "Matara Plot A", disease: "Whitefly", scan: "6 days ago", status: "Under Treatment" },
  { id: "#07", plot: "Matara Plot A", disease: "Bud Rot", scan: "3 days ago", status: "Critical" },
  { id: "#12", plot: "Beliatta Section 2", disease: "Weligama Wilt", scan: "1 day ago", status: "Critical" },
];

const statusColors: Record<Status, [string, string]> = {
  Healthy: ["#DDF3E5", "#178446"],
  "Under Treatment": ["#FFF0CC", "#8A5A00"],
  Critical: ["#FFE1E4", "#D92333"],
};

export default function DiseaseScreen() {
  const [search, setSearch] = useState("");
  const filteredTrees = trees.filter((tree) =>
    `${tree.id} ${tree.plot} ${tree.disease}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logo}><Leaf size={23} color="#FFFFFF" /></View>
            <Text style={styles.headerTitle}>Plantation Dashboard</Text>
            <Pressable
              accessibilityLabel="Open prediction"
              hitSlop={8}
              onPress={() => router.push("/disease/predicition")}
              style={styles.headerAction}
            >
              <Camera size={21} color="#FFFFFF" />
            </Pressable>
            <Bell size={21} color="#FFFFFF" style={styles.bell} />
          </View>
          <View style={styles.headerSearch}><Search size={18} color="#607266" /><TextInput value={search} onChangeText={setSearch} placeholder="Search tree, disease or plot" placeholderTextColor="#607266" style={styles.headerInput} /></View>
        </View>

        <View style={styles.healthCard}>
          <View style={styles.count}><Text style={styles.countValue}>142</Text><Text style={styles.countLabel}>trees</Text></View>
          <View style={styles.health}><Text style={styles.cardTitle}>Plantation Health</Text><HealthRow color="#2DA058" label="Healthy" value="70%" /><HealthRow color="#E99B00" label="Under Treatment" value="20%" /><HealthRow color="#E42535" label="Critical" value="10%" /></View>
        </View>

        <Heading icon={<CircleAlert size={17} color="#E42535" />} title="Urgent attention" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alerts}>
          <Attention tree="#12" plot="Beliatta Section 2" disease="Weligama Wilt" />
          <Attention tree="#07" plot="Matara Plot A" disease="Bud Rot" />
        </ScrollView>

        <Heading icon={<CalendarCheck size={18} color="#16854B" />} title="Today's tasks" />
        <View style={styles.tasks}><Task title="Re-scan Tree #04 to check Mite progression" detail="14 days since last scan" /><Task title="Apply 2nd round of Neem oil mixture to Tree #09" detail="Whitefly treatment plan" /><Task title="Photograph crown of Tree #07 after fungicide" detail="Bud Rot follow-up" /></View>

        <View style={styles.filters}><Filter icon={<SlidersHorizontal size={16} color="#14251A" />} label="All statuses" /><Filter icon={<MapPin size={17} color="#14251A" />} label="All plots" /></View>
        <Filter full icon={<SlidersHorizontal size={16} color="#14251A" />} label="Last scan: oldest first" />

        <View style={styles.listHeading}><Text style={styles.listTitle}>Trees</Text><Text style={styles.results}>{filteredTrees.length} results</Text></View>
        <View style={styles.treeList}>{filteredTrees.map((tree) => <TreeCard key={tree.id} tree={tree} />)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HealthRow({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.healthRow}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={styles.healthLabel}>{label}</Text><Text style={styles.healthValue}>{value}</Text></View>;
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <View style={styles.heading}>{icon}<Text style={styles.headingText}>{title}</Text></View>;
}

function Attention({ tree, plot, disease }: { tree: string; plot: string; disease: string }) {
  return <View style={styles.attention}><View style={styles.attentionRow}><CircleAlert size={17} color="#E42535" /><Text style={styles.attentionTitle}>Tree {tree}: {plot}</Text></View><Text style={styles.attentionDescription}>High probability of {disease}</Text><Text style={styles.action}>Action: Quarantine / removal immediately</Text><Pressable style={styles.plan}><Text style={styles.planText}>View treatment plan</Text></Pressable></View>;
}

function Task({ title, detail }: { title: string; detail: string }) {
  return <View style={styles.task}><View style={styles.taskCircle} /><View><Text style={styles.taskTitle}>{title}</Text><Text style={styles.taskDetail}>{detail}</Text></View></View>;
}

function Filter({ icon, label, full = false }: { icon: React.ReactNode; label: string; full?: boolean }) {
  return <Pressable style={[styles.filter, full && styles.fullFilter]}>{icon}<Text style={styles.filterText}>{label}</Text><ChevronDown size={17} color="#829087" /></Pressable>;
}

function TreeCard({ tree }: { tree: Tree }) {
  const [background, text] = statusColors[tree.status];
  return <View style={styles.treeCard}><View><Text style={styles.treeName}>Tree {tree.id}</Text><Text style={styles.treeMeta}>{tree.plot} · {tree.disease}</Text><Text style={styles.treeScan}>Last scan {tree.scan}</Text></View><View style={[styles.badge, { backgroundColor: background }]}>{tree.status === "Healthy" && <Check size={12} color={text} />}<Text style={[styles.badgeText, { color: text }]}>{tree.status}</Text></View></View>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAF5",
  },
  content: {
    paddingBottom: 24,
  },
  header: { backgroundColor: "#168B46", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 36 },
  headerRow: { alignItems: "center", flexDirection: "row" },
  logo: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 22, height: 42, justifyContent: "center", width: 42 },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginLeft: 12 },
  headerAction: { marginLeft: "auto", marginRight: 18 },
  bell: {},
  headerSearch: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 22, flexDirection: "row", marginHorizontal: 4, marginTop: 16, paddingHorizontal: 13 },
  headerInput: { color: "#1A2A20", flex: 1, fontSize: 14, paddingHorizontal: 9, paddingVertical: 11 },
  healthCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 28, elevation: 3, flexDirection: "row", marginHorizontal: 14, marginTop: -28, paddingHorizontal: 26, paddingVertical: 25, shadowColor: "#183A24", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  count: { alignItems: "center", width: 82 },
  countValue: { color: "#192A20", fontSize: 21, fontWeight: "700" },
  countLabel: { color: "#647166", fontSize: 11, marginTop: 24 },
  health: { flex: 1, marginLeft: 18 },
  cardTitle: { color: "#192A20", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  healthRow: { alignItems: "center", flexDirection: "row", marginTop: 7 },
  dot: { borderRadius: 5, height: 10, width: 10 },
  healthLabel: { color: "#657267", flex: 1, fontSize: 12, marginLeft: 8 },
  healthValue: { color: "#192A20", fontSize: 12, fontWeight: "700" },
  heading: { alignItems: "center", flexDirection: "row", marginLeft: 19, marginTop: 23 },
  headingText: { color: "#1A2A20", fontSize: 14, fontWeight: "700", marginLeft: 8 },
  alerts: { gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  attention: { backgroundColor: "#FFF9F6", borderColor: "#FF8D8D", borderRadius: 25, borderWidth: 1, padding: 15, width: 354 },
  attentionRow: { alignItems: "center", flexDirection: "row" },
  attentionTitle: { color: "#D92333", fontSize: 14, fontWeight: "700", marginLeft: 8 },
  attentionDescription: { color: "#68766C", fontSize: 12, marginTop: 8 },
  action: { color: "#1A2A20", fontSize: 12, marginTop: 9 },
  plan: { alignItems: "center", backgroundColor: "#E51D30", borderRadius: 20, marginTop: 12, paddingVertical: 9 },
  planText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  tasks: { backgroundColor: "#FFFFFF", borderColor: "#DCE4DD", borderRadius: 26, borderWidth: 1, marginHorizontal: 14, marginTop: 11, overflow: "hidden" },
  task: { alignItems: "center", borderBottomColor: "#DCE4DD", borderBottomWidth: 1, flexDirection: "row", minHeight: 67, paddingHorizontal: 16 },
  taskCircle: { borderColor: "#15904E", borderRadius: 10, borderWidth: 1.3, height: 16, marginRight: 12, width: 16 },
  taskTitle: { color: "#1A2A20", fontSize: 12, fontWeight: "600" },
  taskDetail: { color: "#718076", fontSize: 11, marginTop: 4 },
  filters: { flexDirection: "row", gap: 8, marginHorizontal: 14, marginTop: 10 },
  filter: { alignItems: "center", backgroundColor: "#FBFCF8", borderColor: "#D8E1D9", borderRadius: 22, borderWidth: 1, flex: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 44, paddingHorizontal: 13 },
  fullFilter: { marginHorizontal: 14, marginTop: 10 },
  filterText: { color: "#1A2A20", flex: 1, fontSize: 12, textAlign: "center" },
  listHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 19, marginTop: 18 },
  listTitle: { color: "#183322", fontSize: 14, fontWeight: "700" },
  results: { color: "#718076", fontSize: 11 },
  treeList: { gap: 8, marginHorizontal: 14, marginTop: 8 },
  treeCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#D8E1D9", borderRadius: 24, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 82, paddingHorizontal: 14 },
  treeName: { color: "#1A2A20", fontSize: 14, fontWeight: "700" },
  treeMeta: { color: "#637268", fontSize: 11, marginTop: 5 },
  treeScan: { color: "#637268", fontSize: 11, marginTop: 6 },
  badge: { alignItems: "center", borderRadius: 15, flexDirection: "row", gap: 4, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 10, fontWeight: "700" },
});
