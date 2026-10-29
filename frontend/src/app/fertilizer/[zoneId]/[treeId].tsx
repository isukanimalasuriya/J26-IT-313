import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const REFRESH_MS = 1000;

type Sensor = {
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  moisture: number | null;
  ph: number | null;
  slope: number | null;
  soilTemperature: number | null;
  airTemperature: number | null;
  airHumidity: number | null;
  salinity: number | null;
};

type LiveTree = {
  treeCode: string;
  deviceId: string | null;
  sensor: Sensor;
  isOnline: boolean;
  lastUpdated: string | null;
};

const DEMO_SENSORS: Record<string, Partial<Sensor>> = {
  B: {
    nitrogen: 38,
    phosphorus: 28,
    potassium: 52,
    moisture: 61,
    ph: 6.0,
    slope: 12,
  },
  C: {
    nitrogen: 34,
    phosphorus: 24,
    potassium: 48,
    moisture: 72,
    ph: 5.8,
    slope: 19,
  },
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeSensor(raw: any): Sensor {
  return {
    nitrogen: toNumber(raw.nitrogen),
    phosphorus: toNumber(raw.phosphorus),
    potassium: toNumber(raw.potassium),
    moisture: toNumber(raw.moisture),
    ph: toNumber(raw.ph),
    slope: toNumber(raw.slope),
    soilTemperature: toNumber(raw.soilTemperature),
    airTemperature: toNumber(raw.airTemperature),
    airHumidity: toNumber(raw.airHumidity),
    salinity: toNumber(raw.salinity),
  };
}

function format(value: number | null | undefined, unit = "", digits = 1) {
  return value == null || !Number.isFinite(value)
    ? "--"
    : `${Number(value.toFixed(digits))}${unit}`;
}

type MetricCardProps = {
  label: string;
  value: string;
  icon: keyof typeof Icon.glyphMap;
  note?: string;
  tint?: string;
  color?: string;
};

function MetricCard({
  label,
  value,
  icon,
  note,
  tint = "#FFFFFF",
  color = "#237A48",
}: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: tint }]}>
      <View style={styles.metricTop}>
        <Icon name={icon} size={23} color={color} />
        {note ? <Text style={styles.metricNote}>{note}</Text> : null}
      </View>

      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export default function TreeDetailsScreen() {
  const { zoneId, treeId } = useLocalSearchParams<{
    zoneId: string;
    treeId: string;
  }>();

  const zone = (zoneId || "A").toUpperCase();
  const code = (treeId || "A001").toUpperCase();
  const isLive = zone === "A" && code === "A001";

  const [tree, setTree] = useState<LiveTree | null>(null);
  const [loading, setLoading] = useState(isLive);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isLive) {
      setLoading(false);
      return;
    }

    let active = true;
    let busy = false;

    async function fetchSensor() {
      if (busy) return;
      busy = true;

      try {
        if (!API_URL) {
          throw new Error("EXPO_PUBLIC_API_URL is missing.");
        }

        const base = API_URL.replace(/\/$/, "");

        const response = await fetch(
          `${base}/api/zones/${zone}/trees/${code}/latest`,
        );

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Invalid sensor response.");
        }

        if (active) {
          setTree({
            treeCode: result.data.treeCode,
            deviceId: result.data.deviceId,
            sensor: normalizeSensor(result.data.sensor ?? {}),
            isOnline: Boolean(result.data.isOnline),
            lastUpdated: result.data.lastUpdated,
          });

          setError("");
          setNow(Date.now());
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Cannot fetch sensor data.",
          );
        }
      } finally {
        busy = false;
        if (active) setLoading(false);
      }
    }

    fetchSensor();

    const interval = setInterval(fetchSensor, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [zone, code, isLive]);

  const demo = DEMO_SENSORS[zone];

  const sensor: Partial<Sensor> | null = isLive
    ? (tree?.sensor ?? null)
    : (demo ?? null);

  const lastTimestamp = tree?.lastUpdated
    ? new Date(tree.lastUpdated).getTime()
    : NaN;

  const online =
    isLive &&
    !error &&
    !!tree?.isOnline &&
    Number.isFinite(lastTimestamp) &&
    now - lastTimestamp >= 0 &&
    now - lastTimestamp < 60000;

  const sensorStatus = isLive ? (online ? "Online" : "Offline") : "Demo Data";

  const lastUpdated = isLive
    ? Number.isFinite(lastTimestamp)
      ? new Date(lastTimestamp).toLocaleString()
      : "No readings available"
    : "Sample values";

  const nitrogen = sensor?.nitrogen;
  const phosphorus = sensor?.phosphorus;
  const potassium = sensor?.potassium;
  const ph = sensor?.ph;
  const moisture = sensor?.moisture;
  const slope = sensor?.slope;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-left" size={25} color="#374151" />
        </Pressable>

        <Text style={styles.headerTitle}>Tree {code}</Text>

        <Icon name="dots-vertical" size={24} color="#374151" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* TREE PROFILE */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.treeIcon}>
              <Icon name="palm-tree" size={35} color="#16823A" />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.treeTitle}>Coconut Tree {code}</Text>

              <Text style={styles.profileText}>
                <Icon name="map-marker-outline" size={14} />
                {"  "}Zone {zone}
              </Text>

              <Text style={styles.profileText}>
                <Icon name="calendar-outline" size={14} />
                {"  "}Age: Not recorded
              </Text>

              <Text style={styles.profileText}>
                <Icon name="leaf" size={14} />
                {"  "}Variety: Not recorded
              </Text>

              <Text style={styles.profileText}>
                <Icon name="angle-acute" size={14} />
                {"  "}Slope: {format(slope, "°")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Status</Text>

            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: online ? "#16823A" : "#E59A24",
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {isLive
                  ? online
                    ? "Sensor Connected"
                    : "Sensor Offline"
                  : "Demo Tree"}
              </Text>
            </View>
          </View>
        </View>

        {/* SENSOR CONNECTION */}
        <Text style={styles.sectionTitle}>Sensor Information</Text>

        <View style={styles.sensorCard}>
          <View style={styles.sensorHeading}>
            <View style={styles.sensorIcon}>
              <Icon name="access-point" size={24} color="#16823A" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.sensorName}>
                {isLive
                  ? tree?.deviceId || "Sensor Node A"
                  : `Sensor Node ${zone}`}
              </Text>

              <Text style={styles.sensorSub}>{sensorStatus}</Text>
            </View>

            <View
              style={[
                styles.connectionBadge,
                {
                  backgroundColor: online ? "#DCFCE7" : "#F1F5F9",
                },
              ]}
            >
              <Text
                style={{
                  color: online ? "#16823A" : "#64748B",
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {sensorStatus}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{lastUpdated}</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Reading Source</Text>
            <Text style={styles.infoValue}>
              {isLive ? "ESP32 / Backend" : "Demo"}
            </Text>
          </View>
        </View>

        {loading && (
          <ActivityIndicator
            color="#16823A"
            size="large"
            style={{ marginTop: 15 }}
          />
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {!isLive && (
          <Text style={styles.demoNotice}>
            Demonstration values shared across Zone {zone}. Individual tree
            sensor readings are not connected.
          </Text>
        )}

        {/* NPK */}
        <Text style={styles.sectionTitle}>Latest Soil Conditions</Text>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Nitrogen (N)"
            value={format(nitrogen, " mg/kg")}
            icon="flask-outline"
            note={isLive ? "Measured" : "Demo"}
            tint="#FFF5F4"
            color="#D93C38"
          />

          <MetricCard
            label="Phosphorus (P)"
            value={format(phosphorus, " mg/kg")}
            icon="flask-outline"
            note={isLive ? "Measured" : "Demo"}
          />

          <MetricCard
            label="Potassium (K)"
            value={format(potassium, " mg/kg")}
            icon="flask-outline"
            note={isLive ? "Measured" : "Demo"}
            tint="#FFF5F4"
            color="#D93C38"
          />

          <MetricCard
            label="pH Level"
            value={format(ph)}
            icon="ph"
            note={isLive ? "Measured" : "Demo"}
          />
        </View>

        {/* MOISTURE */}
        <View style={styles.moistureCard}>
          <View style={styles.waterIcon}>
            <Icon name="water" size={24} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.moistureLabel}>Soil Moisture</Text>
            <Text style={styles.moistureValue}>{format(moisture, "%")}</Text>
          </View>

          <View style={styles.moistureBadge}>
            <Text style={styles.moistureBadgeText}>
              {isLive ? "Measured" : "Demo"}
            </Text>
          </View>
        </View>

        {/* ENVIRONMENT */}
        <Text style={styles.sectionTitle}>Additional Sensor Details</Text>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Slope Angle"
            value={format(slope, "°")}
            icon="angle-acute"
          />

          <MetricCard
            label="Soil Temperature"
            value={format(sensor?.soilTemperature, "°C")}
            icon="thermometer"
          />

          <MetricCard
            label="Air Temperature"
            value={format(sensor?.airTemperature, "°C")}
            icon="thermometer-lines"
          />

          <MetricCard
            label="Air Humidity"
            value={format(sensor?.airHumidity, "%")}
            icon="water-percent"
          />

          {/* <MetricCard
            label="Salinity"
            value={format(sensor?.salinity, " dS/m", 2)}
            icon="waves"
          /> */}
        </View>

        <Text style={styles.footer}>
          {isLive
            ? "Readings refresh automatically every 10 seconds."
            : "Demo readings are for interface testing only."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 58,
    paddingHorizontal: 16,
    backgroundColor: "#F7F8FC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16823A",
  },
  content: {
    padding: 12,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E8F2",
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  treeIcon: {
    width: 55,
    height: 55,
    backgroundColor: "#E5F2EB",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  treeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#263443",
    marginBottom: 7,
  },
  profileText: {
    color: "#68746C",
    fontSize: 13,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8EDF0",
    marginVertical: 15,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: "#68746C",
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: "#FFF0D9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#805B25",
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 23,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#263443",
  },
  sensorCard: {
    borderWidth: 1,
    borderColor: "#DFE7EF",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 15,
  },
  sensorHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sensorIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
  },
  sensorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#263443",
  },
  sensorSub: {
    fontSize: 12,
    color: "#68746C",
    marginTop: 3,
  },
  connectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#68746C",
  },
  infoValue: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#263443",
    textAlign: "right",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  metricCard: {
    width: "48%",
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#E0E8F2",
    borderRadius: 12,
    padding: 13,
  },
  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricNote: {
    fontSize: 10,
    color: "#66766C",
    backgroundColor: "#E8F3EC",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: "#68746C",
    marginTop: 10,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#263443",
    marginTop: 4,
  },
  moistureCard: {
    marginTop: 13,
    backgroundColor: "#E4EFFB",
    padding: 15,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  waterIcon: {
    width: 36,
    height: 40,
    backgroundColor: "#3F83C9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  moistureLabel: {
    fontSize: 12,
    color: "#68746C",
  },
  moistureValue: {
    fontSize: 19,
    fontWeight: "700",
    color: "#263443",
    marginTop: 4,
  },
  moistureBadge: {
    backgroundColor: "#C4DDF5",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
  },
  moistureBadgeText: {
    color: "#27649D",
    fontWeight: "600",
    fontSize: 11,
  },
  error: {
    color: "#B42318",
    fontSize: 12,
    marginTop: 10,
  },
  demoNotice: {
    color: "#8A651A",
    backgroundColor: "#FFF6E6",
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  footer: {
    textAlign: "center",
    color: "#8A948D",
    fontSize: 11,
    marginTop: 25,
  },
});
