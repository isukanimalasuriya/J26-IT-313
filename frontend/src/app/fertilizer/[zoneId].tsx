import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const FARM_LOCATION = { lat: 6.792349, lon: 79.892956 };
const REFRESH_MS = 10000;

type TreeStatus = "Risk" | "Healthy" | "Monitor";
type Tree = { id: string; status: TreeStatus };
type ZoneData = {
  id: string;
  title: string;
  riskLevel: string;
  riskDescription: string;
  nodeName: string;
  lastUpdated: string;
  moisture: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  slope: number;
  trees: Tree[];
};

// B and C are intentionally demo data until connected to real devices.
const ZONE_DATA: Record<string, ZoneData> = {
  A: {
    id: "A", title: "Zone A", riskLevel: "RISK NOT YET ASSESSED",
    riskDescription: "Live soil measurements are available for Tree A001. Nutrient-loss risk needs a validated rainfall and slope assessment.",
    nodeName: "Sensor Node A", lastUpdated: "No readings yet",
    moisture: 0, ph: 0, nitrogen: 0, phosphorus: 0, potassium: 0, slope: 0,
    trees: [{ id: "Tree A001", status: "Monitor" }],
  },
  B: {
    id: "B", title: "Zone B", riskLevel: "DEMO: MODERATE RISK",
    riskDescription: "Sample risk information. This zone is not connected to a sensor yet.",
    nodeName: "Sensor Node B (Demo)", lastUpdated: "Sample data",
    moisture: 61, ph: 6.0, nitrogen: 38, phosphorus: 28, potassium: 52, slope: 12,
    trees: [
      { id: "Tree B011", status: "Monitor" }, { id: "Tree B012", status: "Healthy" },
      { id: "Tree B013", status: "Healthy" }, { id: "Tree B014", status: "Monitor" },
      { id: "Tree B015", status: "Healthy" },
    ],
  },
  C: {
    id: "C", title: "Zone C", riskLevel: "DEMO: HIGH RISK",
    riskDescription: "Sample risk information. This zone is not connected to a sensor yet.",
    nodeName: "Sensor Node C (Demo)", lastUpdated: "Sample data",
    moisture: 72, ph: 5.8, nitrogen: 34, phosphorus: 24, potassium: 48, slope: 19,
    trees: [
      { id: "Tree C021", status: "Risk" }, { id: "Tree C022", status: "Healthy" },
      { id: "Tree C023", status: "Healthy" }, { id: "Tree C024", status: "Monitor" },
      { id: "Tree C025", status: "Healthy" },
    ],
  },
};

type WeatherData = {
  description: string;
  temperature: number;
  humidity: number;
  rainfallNext24h: number;
};
type Sensor = {
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  moisture: number | null;
  ph: number | null;
  soilTemperature: number | null;
  airTemperature: number | null;
  airHumidity: number | null;
  slope: number | null;
  slopePercent: number | null;
};
type LiveTree = {
  treeCode: string;
  deviceId: string | null;
  sensor: Sensor;
  isOnline: boolean;
  lastUpdated: string | null;
};

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function normalizeSensor(raw: Record<string, unknown>): Sensor {
  return {
    nitrogen: numeric(raw.nitrogen), phosphorus: numeric(raw.phosphorus),
    potassium: numeric(raw.potassium), moisture: numeric(raw.moisture),
    ph: numeric(raw.ph), soilTemperature: numeric(raw.soilTemperature),
    airTemperature: numeric(raw.airTemperature), airHumidity: numeric(raw.airHumidity),
    slope: numeric(raw.slope), slopePercent: numeric(raw.slopePercent),
  };
}
function formatValue(value: number | null | undefined, unit = "", digits = 1): string {
  return value == null || !Number.isFinite(value) ? "--" : `${value.toFixed(digits)}${unit}`;
}
function slopeCategory(slope: number | null | undefined): string {
  if (slope == null) return "No data";
  if (slope >= 15) return "High tilt";
  if (slope >= 8) return "Medium tilt";
  return "Low tilt";
}
function soilStatus(value: number | null | undefined, isLive: boolean, demo: string): string {
  return isLive ? (value == null ? "No data" : "Measured") : demo;
}

export default function ZoneDetailsScreen() {
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();
  const normalizedId = (zoneId || "A").toUpperCase();
  const zone = ZONE_DATA[normalizedId] ?? ZONE_DATA.A;
  const isLiveZone = zone.id === "A";
  const [liveTree, setLiveTree] = useState<LiveTree | null>(null);
  const [sensorLoading, setSensorLoading] = useState(isLiveZone);
  const [sensorError, setSensorError] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    if (!isLiveZone) {
      setSensorLoading(false);
      return;
    }
    let active = true;
    let busy = false;
    async function loadTree() {
      if (busy) return;
      busy = true;
      try {
        if (!API_URL) throw new Error("Set EXPO_PUBLIC_API_URL in frontend/.env");
        const response = await fetch(`${API_URL}/api/zones/A/trees/A001/latest`);
        if (!response.ok) throw new Error(`Backend HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success || !result.data) throw new Error("Invalid backend response");
        if (active) {
          setLiveTree({
            treeCode: result.data.treeCode,
            deviceId: result.data.deviceId,
            sensor: normalizeSensor(result.data.sensor ?? {}),
            isOnline: Boolean(result.data.isOnline),
            lastUpdated: result.data.lastUpdated,
          });
          setSensorError("");
        }
      } catch (error) {
        if (active) {
          setSensorError(error instanceof Error ? error.message : "Unable to get sensor data");
        }
      } finally {
        busy = false;
        if (active) setSensorLoading(false);
      }
    }
    loadTree();
    const interval = setInterval(loadTree, REFRESH_MS);
    return () => { active = false; clearInterval(interval); };
  }, [isLiveZone]);

  useEffect(() => {
    let active = true;
    async function loadWeather() {
      try {
        setWeatherLoading(true);
        if (!OPENWEATHER_API_KEY) throw new Error("Missing OpenWeather API key");
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${FARM_LOCATION.lat}&lon=${FARM_LOCATION.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
        const data = await response.json();
        const next = data.list?.[0];
        if (!next) throw new Error("No weather forecast found");
        const next24 = data.list.slice(0, 8);
        if (active) {
          setWeather({
            description: next.weather?.[0]?.description ?? "Unknown",
            temperature: next.main?.temp ?? 0,
            humidity: next.main?.humidity ?? 0,
            rainfallNext24h: next24.reduce((sum: number, item: any) => sum + (item.rain?.["3h"] ?? 0), 0),
          });
          setWeatherError("");
        }
      } catch (error) {
        if (active) setWeatherError(error instanceof Error ? error.message : "Weather unavailable");
      } finally {
        if (active) setWeatherLoading(false);
      }
    }
    loadWeather();
    return () => { active = false; };
  }, []);

  const sensor = isLiveZone ? liveTree?.sensor : null;
  const moisture = isLiveZone ? sensor?.moisture : zone.moisture;
  const ph = isLiveZone ? sensor?.ph : zone.ph;
  const nitrogen = isLiveZone ? sensor?.nitrogen : zone.nitrogen;
  const phosphorus = isLiveZone ? sensor?.phosphorus : zone.phosphorus;
  const potassium = isLiveZone ? sensor?.potassium : zone.potassium;
  const slope = isLiveZone ? sensor?.slope : zone.slope;
  const online = isLiveZone && !sensorError && !!liveTree?.isOnline &&
    !!liveTree.lastUpdated &&
    Date.now() - new Date(liveTree.lastUpdated).getTime() < 60000;
  const isHighRisk = zone.id === "C";
  const isModerateRisk = zone.id === "B";
  const riskColor = isLiveZone ? "#64748B" : isHighRisk ? "#D9271C" : isModerateRisk ? "#E69A13" : "#16823A";
  const riskBackground = isLiveZone ? "#F1F5F9" : isHighRisk ? "#FFE4E1" : "#FFF4D6";
  const getStatusColor = (status: TreeStatus) =>
    status === "Risk" ? "#D71920" : status === "Monitor" ? "#F4A72C" : "#19843B";

  const cards: Array<{
    icon: keyof typeof Icon.glyphMap; label: string; value: string;
    status: string; statusColor: string;
  }> = [
    { icon: "water-outline", label: "Soil Moisture", value: formatValue(moisture, "%"),
      status: soilStatus(moisture, isLiveZone, zone.moisture > 65 ? "High" : zone.moisture >= 40 ? "Normal" : "Low"), statusColor: "#16833F" },
    { icon: "flask-outline", label: "pH Level", value: formatValue(ph),
      status: soilStatus(ph, isLiveZone, zone.ph < 6 ? "Slightly Acidic" : "Normal"), statusColor: "#16833F" },
    { icon: "sprout-outline", label: "Nitrogen", value: formatValue(nitrogen, " mg/kg"),
      status: soilStatus(nitrogen, isLiveZone, zone.nitrogen < 35 ? "Low" : "Normal"), statusColor: "#16833F" },
    { icon: "atom", label: "Phosphorus", value: formatValue(phosphorus, " mg/kg"),
      status: soilStatus(phosphorus, isLiveZone, zone.phosphorus < 20 ? "Low" : "Normal"), statusColor: "#16833F" },
    { icon: "circle-double", label: "Potassium", value: formatValue(potassium, " mg/kg"),
      status: soilStatus(potassium, isLiveZone, zone.potassium < 50 ? "Low" : "Normal"), statusColor: "#16833F" },
    { icon: "angle-acute", label: "Slope / Tilt", value: formatValue(slope, "°"),
      status: isLiveZone ? slopeCategory(slope) : slopeCategory(zone.slope), statusColor: "#16833F" },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
              <Icon name="arrow-left" size={21} color="#16763D" />
            </Pressable>
            <Text style={styles.headerTitle}>{zone.title}</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.profileButton}>
              <Icon name="account-outline" size={17} color="#596A61" />
            </View>
            <View style={styles.notificationButton}>
              <Icon name="bell-outline" size={20} color="#198342" />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
            <Icon name="alert-outline" size={14} color="#FFFFFF" />
            <Text style={styles.riskBadgeText}>{zone.riskLevel}</Text>
          </View>
          <View style={[styles.alertCard, { backgroundColor: riskBackground, borderColor: riskColor }]}>
            <Icon name="alert-circle-outline" size={18} color={riskColor} />
            <Text style={[styles.alertText, { color: isLiveZone ? "#475569" : isHighRisk ? "#9E1515" : "#5C5C48" }]}>
              {zone.riskDescription}
            </Text>
          </View>

          <View style={styles.weatherCard}>
            <View style={styles.weatherTopRow}>
              <View style={styles.weatherIcon}>
                <Icon name="weather-rainy" size={24} color="#0A9344" />
              </View>
              <View style={styles.weatherMain}>
                <Text style={styles.weatherLabel}>Weather Forecast</Text>
                {weatherLoading ? (
                  <Text style={styles.weatherTitle}>Loading weather...</Text>
                ) : weatherError ? (
                  <Text style={styles.weatherError}>{weatherError}</Text>
                ) : weather ? (
                  <>
                    <Text style={styles.weatherTitle}>{weather.description}</Text>
                    <Text style={styles.weatherTemperature}>{weather.temperature.toFixed(1)}°C</Text>
                  </>
                ) : null}
              </View>
            </View>
            {weather && !weatherLoading && !weatherError && (
              <View style={styles.weatherInfoRow}>
                <View style={styles.weatherInfoItem}>
                  <Icon name="water-percent" size={18} color="#647067" />
                  <Text style={styles.weatherInfoLabel}>Humidity</Text>
                  <Text style={styles.weatherInfoValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherDivider} />
                <View style={styles.weatherInfoItem}>
                  <Icon name="weather-pouring" size={18} color="#647067" />
                  <Text style={styles.weatherInfoLabel}>Rain next 24h</Text>
                  <Text style={styles.weatherInfoValue}>{weather.rainfallNext24h.toFixed(1)} mm</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.sensorCard}>
            <View style={styles.sensorLeft}>
              <View style={[styles.onlineDot, { backgroundColor: isLiveZone ? (online ? "#1BA54A" : "#94A3B8") : "#94A3B8" }]} />
              <View>
                <Text style={styles.sensorTitle}>
                  {isLiveZone ? (liveTree?.deviceId ?? "esp32_001") : zone.nodeName}
                </Text>
                <Text style={styles.sensorStatus}>
                  {isLiveZone
                    ? sensorError ? "Connection error" : sensorLoading && !liveTree ? "Loading..." : online ? "Online" : "Offline / no recent upload"
                    : "Demo sensor"}
                </Text>
              </View>
            </View>
            <Text style={styles.updated}>
              {isLiveZone
                ? liveTree?.lastUpdated ? new Date(liveTree.lastUpdated).toLocaleTimeString() : "No reading"
                : zone.lastUpdated}
            </Text>
          </View>
          {isLiveZone && !!sensorError && <Text style={styles.weatherError}>{sensorError}</Text>}
          {isLiveZone && (
            <Text style={styles.dialogNote}>
              Measurements from Tree A001. {online ? "Receiving recent uploads." : "Last saved readings may be stale."}
            </Text>
          )}

          <Text style={styles.sectionTitle}>Current Soil Conditions</Text>
          <View style={styles.conditionsGrid}>
            {cards.map((card) => (
              <SoilCard key={card.label} {...card} />
            ))}
          </View>

          {isLiveZone && (
            <>
              <Text style={styles.sectionTitle}>Additional Sensor Readings</Text>
              <View style={styles.conditionsGrid}>
                <SoilCard icon="thermometer" label="Soil Temperature" value={formatValue(sensor?.soilTemperature, "°C")} status="Sensor" statusColor="#16833F" />
                <SoilCard icon="thermometer" label="Air Temperature" value={formatValue(sensor?.airTemperature, "°C")} status="Sensor" statusColor="#16833F" />
                <SoilCard icon="water-percent" label="Air Humidity" value={formatValue(sensor?.airHumidity, "%")} status="Sensor" statusColor="#16833F" />
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Trees in this Zone</Text>
          <View style={styles.treeContainer}>
            {zone.trees.map((tree, index) => (
              <View key={tree.id} style={[styles.treeRow, index !== zone.trees.length - 1 && styles.treeBorder]}>
                <View style={styles.treeLeft}>
                  <Icon name="palm-tree" size={19} color="#15823C" />
                  <Text style={styles.treeName}>{tree.id}</Text>
                </View>
                <View style={styles.treeStatus}>
                  <View style={[styles.statusDot, { backgroundColor: isLiveZone ? (online ? "#1BA54A" : "#94A3B8") : getStatusColor(tree.status) }]} />
                  <Text style={styles.treeStatusText}>
                    {isLiveZone ? (online ? "Connected" : "Offline") : `${tree.status} (Demo)`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type SoilCardProps = {
  icon: keyof typeof Icon.glyphMap;
  label: string;
  value: string;
  status: string;
  statusColor: string;
};
function SoilCard({ icon, label, value, status, statusColor }: SoilCardProps) {
  return (
    <View style={styles.conditionCard}>
      <Icon name={icon} size={20} color="#16833F" />
      <Text style={styles.conditionLabel}>{label}</Text>
      <View style={styles.conditionValueRow}>
        <Text style={styles.conditionValue}>{value}</Text>
        <Text style={[styles.conditionStatus, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  safe: {

    flex: 1,

    backgroundColor: "#FFFFFF",

  },

  container: {

    flex: 1,

    backgroundColor: "#FFFFFF",

  },

  header: {

    height: 60,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "#EDF0F2",

    backgroundColor: "#FFFFFF",

  },

  headerLeft: {

    flexDirection: "row",

    alignItems: "center",

  },

  backButton: {

    width: 36,

    height: 44,

    alignItems: "center",

    justifyContent: "center",

  },

  headerTitle: {

    fontSize: 18,

    fontWeight: "700",

    color: "#1F2937",

  },

  headerActions: {

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

  },

  profileButton: {

    width: 34,

    height: 34,

    borderRadius: 17,

    backgroundColor: "#EDF2F0",

    alignItems: "center",

    justifyContent: "center",

  },

  notificationButton: {

    width: 34,

    height: 40,

    alignItems: "center",

    justifyContent: "center",

  },

  scrollContent: {

    paddingHorizontal: 14,

    paddingTop: 16,

    paddingBottom: 28,

  },

  riskBadge: {

    alignSelf: "flex-start",

    borderRadius: 20,

    paddingHorizontal: 12,

    paddingVertical: 7,

    flexDirection: "row",

    alignItems: "center",

    gap: 6,

    marginBottom: 8,

  },

  riskBadgeText: {

    color: "#FFFFFF",

    fontSize: 11,

    fontWeight: "700",

  },

  alertCard: {

    minHeight: 78,

    borderWidth: 1,

    borderRadius: 12,

    flexDirection: "row",

    alignItems: "flex-start",

    paddingHorizontal: 14,

    paddingVertical: 14,

    gap: 10,

  },

  alertText: {

    flex: 1,

    fontSize: 13,

    lineHeight: 19,

  },

  weatherCard: {

    marginTop: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#E0E8E3",

    padding: 14,

    shadowColor: "#1D4D31",

    shadowOpacity: 0.06,

    shadowRadius: 8,

    shadowOffset: {

      width: 0,

      height: 3,

    },

    elevation: 2,

  },

  weatherTopRow: {

    flexDirection: "row",

    alignItems: "center",

  },

  weatherIcon: {

    width: 48,

    height: 48,

    borderRadius: 24,

    backgroundColor: "#EAF7EE",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 12,

  },

  weatherMain: {

    flex: 1,

  },

  weatherLabel: {

    fontSize: 12,

    color: "#778078",

  },

  weatherTitle: {

    fontSize: 16,

    fontWeight: "700",

    color: "#243129",

    textTransform: "capitalize",

    marginTop: 2,

  },

  weatherTemperature: {

    fontSize: 26,

    fontWeight: "800",

    color: "#087C35",

    marginTop: 4,

  },

  weatherError: {

    fontSize: 13,

    color: "#C62828",

    marginTop: 3,

  },

  weatherInfoRow: {

    flexDirection: "row",

    alignItems: "center",

    marginTop: 14,

    paddingTop: 13,

    borderTopWidth: 1,

    borderTopColor: "#EEF2EF",

  },

  weatherInfoItem: {

    flex: 1,

    alignItems: "center",

  },

  weatherInfoLabel: {

    fontSize: 11,

    color: "#7C857F",

    marginTop: 4,

  },

  weatherInfoValue: {

    fontSize: 14,

    fontWeight: "700",

    color: "#344139",

    marginTop: 3,

  },

  weatherDivider: {

    width: 1,

    height: 42,

    backgroundColor: "#E6ECE8",

  },

  sensorCard: {

    marginTop: 14,

    minHeight: 52,

    borderRadius: 9,

    backgroundColor: "#F0F4FF",

    paddingHorizontal: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

  },

  sensorLeft: {

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

  },

  onlineDot: {

    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: "#1BA54A",

  },

  sensorTitle: {

    fontSize: 12,

    fontWeight: "600",

    color: "#35423A",

  },

  sensorStatus: {

    fontSize: 11,

    color: "#35423A",

    marginTop: 2,

  },

  updated: {

    maxWidth: 100,

    fontSize: 10,

    lineHeight: 14,

    color: "#666F69",

    textAlign: "right",

  },

  sectionTitle: {

    marginTop: 18,

    marginBottom: 10,

    fontSize: 18,

    fontWeight: "700",

    color: "#18232A",

  },

  conditionsGrid: {

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    rowGap: 12,

  },

  conditionCard: {

    width: "48.5%",

    minHeight: 96,

    borderWidth: 1,

    borderColor: "#DCE5EF",

    borderRadius: 10,

    paddingHorizontal: 12,

    paddingVertical: 12,

    backgroundColor: "#FFFFFF",

    shadowColor: "#17492D",

    shadowOpacity: 0.03,

    shadowRadius: 5,

    shadowOffset: {

      width: 0,

      height: 2,

    },

    elevation: 1,

  },

  conditionLabel: {

    fontSize: 12,

    color: "#58655E",

    marginTop: 5,

  },

  conditionValueRow: {

    flexDirection: "row",

    alignItems: "baseline",

    flexWrap: "wrap",

    marginTop: 4,

  },

  conditionValue: {

    fontSize: 15,

    fontWeight: "700",

    color: "#27342C",

  },

  conditionStatus: {

    fontSize: 11,

    marginLeft: 4,

  },

  treeContainer: {

    borderRadius: 10,

    borderWidth: 1,

    borderColor: "#DDE6EF",

    paddingHorizontal: 6,

    paddingVertical: 6,

    backgroundColor: "#FFFFFF",

    shadowColor: "#203F2B",

    shadowOpacity: 0.06,

    shadowRadius: 6,

    shadowOffset: {

      width: 0,

      height: 2,

    },

    elevation: 2,

  },

  treeRow: {

    minHeight: 48,

    borderRadius: 7,

    backgroundColor: "#F1F5FF",

    paddingHorizontal: 12,

    marginBottom: 4,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

  },

  treeBorder: {},

  treeLeft: {

    flexDirection: "row",

    alignItems: "center",

    gap: 9,

  },

  treeName: {

    fontSize: 14,

    fontWeight: "600",

    color: "#2D3932",

  },

  treeStatus: {

    flexDirection: "row",

    alignItems: "center",

    gap: 6,

  },

  statusDot: {

    width: 8,

    height: 8,

    borderRadius: 4,

  },

  treeStatusText: {

    fontSize: 12,

    color: "#4E5A53",

  },

});