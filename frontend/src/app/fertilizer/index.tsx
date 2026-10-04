import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

type Zone = {
  id: string;
  name: string;
  slope: string;
  trees: number;
  moisture: number;
  status: string;
  color: string;
  tint: string;
};
const INITIAL_ZONES: Zone[] = [
  {
    id: "A",
    name: "Zone A",
    slope: "Low slope",
    trees: 18,
    moisture: 46,
    status: "Normal",
    color: "#087C35",
    tint: "#EBF5ED",
  },
  {
    id: "B",
    name: "Zone B",
    slope: "Medium slope",
    trees: 16,
    moisture: 61,
    status: "Monitor",
    color: "#E8860B",
    tint: "#FFF6E9",
  },
  {
    id: "C",
    name: "Zone C",
    slope: "High slope",
    trees: 17,
    moisture: 73,
    status: "High Risk",
    color: "#D61D2C",
    tint: "#FFF0F1",
  },
];

export default function FertilizerScreen() {
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [selected, setSelected] = useState<Zone | null>(null);
  const [panel, setPanel] = useState<"register" | "zones" | null>(null);
  const [treeName, setTreeName] = useState("");
  const [zoneId, setZoneId] = useState("A");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const total = zones.reduce((sum, zone) => sum + zone.trees, 0);

  function close() {
    setPanel(null);
    setSelected(null);
    setError("");
  }
  function register() {
    const name = treeName.trim();
    if (!name) {
      setError("Enter a tree name or ID.");
      return;
    }
    if (names.includes(name.toLowerCase())) {
      setError("This tree ID was already added in this session.");
      return;
    }
    setZones((previous) =>
      previous.map((zone) =>
        zone.id === zoneId ? { ...zone, trees: zone.trees + 1 } : zone,
      ),
    );
    setNames((previous) => [...previous, name.toLowerCase()]);
    setNotice(`${name} added to Zone ${zoneId} for this session.`);
    setTreeName("");
    close();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.hero}>
            <Image
              source={require("../../../assets/images/coconut-farm.jpg")}
              style={styles.heroImage}
              resizeMode="cover"
              accessible={false}
            />
            <LinearGradient
              colors={[
                "#FFFFFF",
                "rgba(255,255,255,0.94)",
                "rgba(255,255,255,0.08)",
              ]}
              locations={[0, 0.36, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["rgba(255,255,255,0)", "#FFFFFF"]}
              style={styles.bottomFade}
            />
            <View style={styles.heroText}>
              <Text style={styles.title}>My Farm</Text>
              <Text style={styles.subtitle}>Green Valley Coconut Farm</Text>
              <View style={styles.riskBadge}>
                <View style={[styles.dot, { backgroundColor: "#F39A25" }]} />
                <Text style={styles.riskText}>Moderate Risk</Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.summary}>
              <View style={styles.stat}>
                <View style={styles.statIcon}>
                  <Icon name="palm-tree" size={28} color="#338B48" />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Total Trees</Text>
                  <Text style={styles.statValue}>{total}</Text>
                  <Text style={styles.statHint}>
                    Active {zones.length} zones
                  </Text>
                </View>
              </View>
              <View style={styles.stat}>
                <View style={styles.statIcon}>
                  <Icon name="map-marker-outline" size={27} color="#087C35" />
                </View>
                <View style={styles.statText}>
                  <Text style={styles.statLabel}>Monitoring Zones</Text>
                  <Text style={styles.statValue}>{zones.length}</Text>
                  <Text style={styles.statHint}>Active</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Active Zones</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPanel("zones")}
                style={styles.seeAll}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>

            {zones.map((zone) => (
              <Pressable
                key={zone.id}
                accessibilityRole="button"
                accessibilityLabel={`${zone.name}, ${zone.slope}, ${zone.trees} trees, ${zone.status}, soil moisture ${zone.moisture} percent. View details.`}
                onPress={() => setSelected(zone)}
                style={({ pressed }) => [
                  styles.zoneCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.zoneTop}>
                  <View
                    style={[styles.zoneIcon, { backgroundColor: zone.tint }]}
                  >
                    <Icon
                      name={zone.id === "C" ? "layers-triple" : "terrain"}
                      size={25}
                      color={zone.color}
                    />
                  </View>
                  <View style={styles.zoneNameWrap}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.zoneDescription}>
                      {zone.slope} • {zone.trees} trees
                    </Text>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: zone.tint }]}
                  >
                    <View
                      style={[styles.dot, { backgroundColor: zone.color }]}
                    />
                    <Text style={[styles.statusText, { color: zone.color }]}>
                      {zone.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.zoneBottom}>
                  <View>
                    <Text style={styles.moistureLabel}>Soil Moisture</Text>
                    <Text style={[styles.moistureValue, { color: zone.color }]}>
                      {zone.moisture}%
                    </Text>
                  </View>
                  <View style={styles.sensorRow}>
                    <View style={styles.sensor}>
                      <Text style={styles.moistureLabel}>Sensor</Text>
                      <View style={styles.signal}>
                        <Icon name="access-point" size={14} color="#087C35" />
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: "#24B77A", width: 5, height: 5 },
                          ]}
                        />
                      </View>
                    </View>
                    <Icon name="chevron-right" size={23} color="#4B5850" />
                  </View>
                </View>
              </Pressable>
            ))}

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setError("");
                setPanel("register");
              }}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="plus-circle-outline" size={22} color="#087C35" />
              <Text style={styles.registerText}>Register Tree</Text>
            </Pressable>
            {!!notice && (
              <Text accessibilityLiveRegion="polite" style={styles.notice}>
                {notice}
              </Text>
            )}
            <Text style={styles.demoNote}>Demo farm • sample readings</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={panel !== null || selected !== null}
        animationType="fade"
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          />
          <View style={styles.dialog} accessibilityViewIsModal>
            <View style={styles.dialogHeading}>
              <Text style={styles.dialogTitle}>
                {panel === "register"
                  ? "Register Tree"
                  : selected
                    ? selected.name
                    : "All Zones"}
              </Text>
              <Pressable
                onPress={close}
                accessibilityLabel="Close"
                accessibilityRole="button"
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#46554C" />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {panel === "register" ? (
                <>
                  <Text style={styles.dialogNote}>
                    Add a tree to your demo farm. Changes last until this screen
                    resets.
                  </Text>
                  <Text style={styles.inputLabel}>Tree name or ID</Text>
                  <TextInput
                    value={treeName}
                    onChangeText={setTreeName}
                    placeholder="e.g. Coconut A-019"
                    placeholderTextColor="#87928A"
                    style={styles.input}
                    maxLength={60}
                    accessibilityLabel="Tree name or ID"
                  />
                  <Text style={styles.inputLabel}>Select zone</Text>
                  <View style={styles.choices}>
                    {zones.map((zone) => (
                      <Pressable
                        key={zone.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: zoneId === zone.id }}
                        onPress={() => setZoneId(zone.id)}
                        style={[
                          styles.choice,
                          zoneId === zone.id && styles.selectedChoice,
                        ]}
                      >
                        <Text
                          style={{
                            color: zoneId === zone.id ? "#087C35" : "#637067",
                            fontWeight: "600",
                          }}
                        >
                          {zone.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {!!error && (
                    <Text accessibilityLiveRegion="polite" style={styles.error}>
                      {error}
                    </Text>
                  )}
                  <Pressable
                    onPress={register}
                    accessibilityRole="button"
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveText}>Add Tree</Text>
                  </Pressable>
                </>
              ) : selected ? (
                <>
                  <Text style={styles.dialogNote}>
                    {selected.slope} • {selected.trees} trees
                  </Text>
                  <Text
                    style={[styles.detailMoisture, { color: selected.color }]}
                  >
                    {selected.moisture}%
                  </Text>
                  <Text style={styles.dialogNote}>Average soil moisture</Text>
                  <Text
                    style={[styles.detailStatus, { color: selected.color }]}
                  >
                    {selected.status}
                  </Text>
                  <Text style={styles.dialogNote}>
                    Sensor connected (demo). These readings and risk labels are
                    sample data.
                  </Text>
                </>
              ) : (
                zones.map((zone) => (
                  <Pressable
                    key={zone.id}
                    accessibilityRole="button"
                    onPress={() => {
                      setPanel(null);
                      setSelected(zone);
                    }}
                    style={styles.zoneListItem}
                  >
                    <View>
                      <Text style={styles.zoneName}>{zone.name}</Text>
                      <Text style={styles.zoneDescription}>
                        {zone.trees} trees • {zone.slope}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={22} color={zone.color} />
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flexGrow: 1, alignItems: "center", paddingBottom: 28 },
  page: { width: "100%", maxWidth: 520 },
  hero: { height: 190, overflow: "hidden", backgroundColor: "#EDF3E9" },
  heroImage: {
    position: "absolute",
    width: "75%",
    height: "100%",
    right: 0,
    top: 0,
  },
  bottomFade: { position: "absolute", bottom: 0, height: 44, width: "100%" },
  heroText: { paddingHorizontal: 18, paddingTop: 36 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#172330",
    letterSpacing: -0.7,
  },
  subtitle: { fontSize: 15, color: "#4F5D50", marginTop: 7 },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FFD7A8",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 13,
    backgroundColor: "#FFF8EF",
  },
  riskText: { color: "#8A7761", fontSize: 11, fontWeight: "500" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  body: { paddingHorizontal: 16 },
  summary: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 19,
    marginTop: -35,
    shadowColor: "#1F6535",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  stat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D9EADD",
    alignItems: "center",
    justifyContent: "center",
  },
  statText: { flex: 1 },
  statLabel: { color: "#7D827E", fontSize: 10 },
  statValue: {
    color: "#087C35",
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 27,
  },
  statHint: { color: "#7D827E", fontSize: 10, marginTop: 2 },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTitle: { color: "#172330", fontSize: 18, fontWeight: "700" },
  seeAll: { minHeight: 44, justifyContent: "center", paddingLeft: 16 },
  seeAllText: { color: "#737A75", fontSize: 12 },
  zoneCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EDF8",
    borderRadius: 13,
    padding: 17,
    marginBottom: 14,
    shadowColor: "#285B37",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: { opacity: 0.75 },
  zoneTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  zoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneNameWrap: { flex: 1 },
  zoneName: { fontSize: 17, color: "#172330", fontWeight: "700" },
  zoneDescription: { color: "#536052", fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#E6EDF8", marginVertical: 15 },
  zoneBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moistureLabel: { fontSize: 12, color: "#364534" },
  moistureValue: { fontSize: 15, fontWeight: "600", marginTop: 3 },
  sensorRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sensor: { alignItems: "flex-end" },
  signal: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 1 },
  registerButton: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: "#087C35",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 1,
  },
  registerText: { color: "#087C35", fontWeight: "600", fontSize: 16 },
  demoNote: {
    textAlign: "center",
    color: "#7A887E",
    fontSize: 10,
    marginTop: 18,
  },
  notice: {
    color: "#087C35",
    fontSize: 12,
    textAlign: "center",
    marginTop: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17,35,24,0.38)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
  },
  dialogHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dialogTitle: { fontSize: 22, fontWeight: "700", color: "#172330" },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogNote: {
    color: "#637067",
    lineHeight: 21,
    fontSize: 14,
    marginVertical: 9,
  },
  inputLabel: {
    fontSize: 13,
    color: "#364534",
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 9,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D8E3DB",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: "#172330",
  },
  choices: { flexDirection: "row", gap: 8 },
  choice: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#D8E3DB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChoice: { borderColor: "#087C35", backgroundColor: "#EBF5ED" },
  error: { color: "#D61D2C", marginTop: 12 },
  saveButton: {
    backgroundColor: "#087C35",
    padding: 15,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 24,
  },
  saveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  detailMoisture: { fontSize: 42, fontWeight: "700", marginTop: 14 },
  detailStatus: { fontSize: 16, fontWeight: "600", marginTop: 10 },
  zoneListItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#E6EDF8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
