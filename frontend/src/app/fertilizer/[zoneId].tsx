import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const OPENWEATHER_API_KEY =
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

const FARM_LOCATION = {
  lat: 6.792349,
  lon: 79.892956,
};

type TreeStatus = "Risk" | "Healthy" | "Monitor";

type Tree = {
  id: string;
  status: TreeStatus;
};

type ZoneData = {
  id: string;
  title: string;
  riskLevel: string;
  riskDescription: string;
  rainfall: string;
  rainfallAmount: string;
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

const ZONE_DATA: Record<string, ZoneData> = {
  A: {
    id: "A",
    title: "Zone A",
    riskLevel: "LOW NUTRIENT LOSS RISK",
    riskDescription:
      "Current weather and slope conditions show a low fertilizer wash-away risk.",
    rainfall: "Light rain possible",
    rainfallAmount: "8 mm predicted rainfall",
    nodeName: "Sensor Node A",
    lastUpdated: "Last updated 1 min ago",
    moisture: 46,
    ph: 6.2,
    nitrogen: 42,
    phosphorus: 31,
    potassium: 55,
    slope: 5,
    trees: [
      { id: "Tree A001", status: "Healthy" },
      { id: "Tree A002", status: "Healthy" },
      { id: "Tree A003", status: "Healthy" },
      { id: "Tree A004", status: "Monitor" },
      { id: "Tree A005", status: "Healthy" },
    ],
  },

  B: {
    id: "B",
    title: "Zone B",
    riskLevel: "MODERATE NUTRIENT LOSS RISK",
    riskDescription:
      "Rainfall and medium slope conditions may cause some fertilizer loss.",
    rainfall: "Moderate rain expected",
    rainfallAmount: "26 mm predicted rainfall",
    nodeName: "Sensor Node B",
    lastUpdated: "Last updated 2 mins ago",
    moisture: 61,
    ph: 6.0,
    nitrogen: 38,
    phosphorus: 28,
    potassium: 52,
    slope: 12,
    trees: [
      { id: "Tree B011", status: "Monitor" },
      { id: "Tree B012", status: "Healthy" },
      { id: "Tree B013", status: "Healthy" },
      { id: "Tree B014", status: "Monitor" },
      { id: "Tree B015", status: "Healthy" },
    ],
  },

  C: {
    id: "C",
    title: "Zone C",
    riskLevel: "HIGH NUTRIENT LOSS RISK",
    riskDescription:
      "Heavy rainfall combined with the steep slope may cause fertilizer wash-away.",
    rainfall: "Heavy rain tomorrow",
    rainfallAmount: "48 mm predicted rainfall",
    nodeName: "Sensor Node C",
    lastUpdated: "Last updated 2 mins ago",
    moisture: 72,
    ph: 5.8,
    nitrogen: 34,
    phosphorus: 24,
    potassium: 48,
    slope: 19,
    trees: [
      { id: "Tree C021", status: "Risk" },
      { id: "Tree C022", status: "Healthy" },
      { id: "Tree C023", status: "Healthy" },
      { id: "Tree C024", status: "Monitor" },
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

export default function ZoneDetailsScreen() {
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();

  const normalizedId = (zoneId ?? "C").toUpperCase();

  const zone = ZONE_DATA[normalizedId] ?? ZONE_DATA.C;

  const [weather, setWeather] =
  useState<WeatherData | null>(null);

const [weatherLoading, setWeatherLoading] =
  useState(true);

const [weatherError, setWeatherError] =
  useState("");

  useEffect(() => {
  async function fetchWeather() {
    try {
      setWeatherLoading(true);
      setWeatherError("");

      if (!OPENWEATHER_API_KEY) {
        throw new Error("OpenWeather API key missing");
      }

      const url =
        `https://api.openweathermap.org/data/2.5/forecast` +
        `?lat=${FARM_LOCATION.lat}` +
        `&lon=${FARM_LOCATION.lon}` +
        `&units=metric` +
        `&appid=${OPENWEATHER_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Weather request failed: ${response.status}`,
        );
      }

      const data = await response.json();

      const firstForecast = data.list?.[0];

      if (!firstForecast) {
        throw new Error("No forecast data found");
      }

      // 8 forecasts × 3 hours = approximately 24 hours
      const next24Hours = data.list.slice(0, 8);

      const rainfallNext24h =
        next24Hours.reduce(
          (total: number, item: any) => {
            return total + (item.rain?.["3h"] ?? 0);
          },
          0,
        );

      setWeather({
        description:
          firstForecast.weather?.[0]?.description ??
          "Unknown",

        temperature:
          firstForecast.main?.temp ?? 0,

        humidity:
          firstForecast.main?.humidity ?? 0,

        rainfallNext24h,
      });
    } catch (error) {
      console.error("Weather error:", error);

      setWeatherError(
        error instanceof Error
          ? error.message
          : "Unable to load weather",
      );
    } finally {
      setWeatherLoading(false);
    }
  }

  fetchWeather();
}, []);

  const isHighRisk = zone.id === "C";
  const isModerateRisk = zone.id === "B";

  const riskColor = isHighRisk
    ? "#D9271C"
    : isModerateRisk
      ? "#E69A13"
      : "#16823A";

  const riskBackground = isHighRisk
    ? "#FFE4E1"
    : isModerateRisk
      ? "#FFF4D6"
      : "#E8F6EC";

  function getStatusColor(status: TreeStatus) {
    switch (status) {
      case "Risk":
        return "#D71920";

      case "Monitor":
        return "#F4A72C";

      default:
        return "#19843B";
    }
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={10}
            >
              <Icon
                name="arrow-left"
                size={21}
                color="#16763D"
              />
            </Pressable>

            <Text style={styles.headerTitle}>{zone.title}</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable style={styles.profileButton}>
              <Icon
                name="account-outline"
                size={17}
                color="#596A61"
              />
            </Pressable>

            <Pressable style={styles.notificationButton}>
              <Icon
                name="bell-outline"
                size={20}
                color="#198342"
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Risk Badge */}
          <View
            style={[
              styles.riskBadge,
              {
                backgroundColor: riskColor,
              },
            ]}
          >
            <Icon
              name="alert-outline"
              size={14}
              color="#FFFFFF"
            />

            <Text style={styles.riskBadgeText}>
              {zone.riskLevel}
            </Text>
          </View>

          {/* Risk Alert */}
          <View
            style={[
              styles.alertCard,
              {
                backgroundColor: riskBackground,
                borderColor: riskColor,
              },
            ]}
          >
            <Icon
              name="alert-circle-outline"
              size={18}
              color={riskColor}
            />

            <Text
              style={[
                styles.alertText,
                {
                  color: isHighRisk ? "#9E1515" : "#5C5C48",
                },
              ]}
            >
              {zone.riskDescription}
            </Text>
          </View>

          {/* Weather */}
          {/* Live Weather */}
<View style={styles.weatherCard}>
  <View style={styles.weatherTopRow}>
    <View style={styles.weatherIcon}>
      <Icon
        name="weather-rainy"
        size={24}
        color="#0A9344"
      />
    </View>

    <View style={styles.weatherMain}>
      <Text style={styles.weatherLabel}>
        Weather Forecast
      </Text>

      {weatherLoading ? (
        <Text style={styles.weatherTitle}>
          Loading weather...
        </Text>
      ) : weatherError ? (
        <Text style={styles.weatherError}>
          Weather unavailable
        </Text>
      ) : weather ? (
        <>
          <Text style={styles.weatherTitle}>
            {weather.description}
          </Text>

          <Text style={styles.weatherTemperature}>
            {weather.temperature.toFixed(1)}°C
          </Text>
        </>
      ) : null}
    </View>
  </View>

  {!weatherLoading &&
    !weatherError &&
    weather && (
      <View style={styles.weatherInfoRow}>
        <View style={styles.weatherInfoItem}>
          <Icon
            name="water-percent"
            size={18}
            color="#647067"
          />

          <Text style={styles.weatherInfoLabel}>
            Humidity
          </Text>

          <Text style={styles.weatherInfoValue}>
            {weather.humidity}%
          </Text>
        </View>

        <View style={styles.weatherDivider} />

        <View style={styles.weatherInfoItem}>
          <Icon
            name="weather-pouring"
            size={18}
            color="#647067"
          />

          <Text style={styles.weatherInfoLabel}>
            Rain next 24h
          </Text>

          <Text style={styles.weatherInfoValue}>
            {weather.rainfallNext24h.toFixed(1)} mm
          </Text>
        </View>
      </View>
    )}
</View>

          {/* Sensor */}
          <View style={styles.sensorCard}>
            <View style={styles.sensorLeft}>
              <View style={styles.onlineDot} />

              <View>
                <Text style={styles.sensorTitle}>
                  {zone.nodeName} -
                </Text>

                <Text style={styles.sensorStatus}>
                  Online
                </Text>
              </View>
            </View>

            <Text style={styles.updated}>
              {zone.lastUpdated}
            </Text>
          </View>

          {/* Soil Conditions */}
          <Text style={styles.sectionTitle}>
            Current Soil Conditions
          </Text>

          <View style={styles.conditionsGrid}>
            {/* Moisture */}
            <SoilCard
              icon="water-outline"
              label="Soil Moisture"
              value={`${zone.moisture}%`}
              status={
                zone.moisture > 65
                  ? "High"
                  : zone.moisture >= 40
                    ? "Normal"
                    : "Low"
              }
              statusColor={
                zone.moisture > 65
                  ? "#D63B40"
                  : "#16833F"
              }
            />

            {/* PH */}
            <SoilCard
              icon="flask-outline"
              label="pH Level"
              value={zone.ph.toFixed(1)}
              status={
                zone.ph < 6
                  ? "Slightly Acidic"
                  : "Normal"
              }
              statusColor={
                zone.ph < 6
                  ? "#D88925"
                  : "#16833F"
              }
            />

            {/* Nitrogen */}
            <SoilCard
              icon="sprout-outline"
              label="Nitrogen"
              value={`${zone.nitrogen} mg/kg`}
              status={
                zone.nitrogen < 35
                  ? "Low"
                  : "Normal"
              }
              statusColor={
                zone.nitrogen < 35
                  ? "#D63B40"
                  : "#16833F"
              }
            />

            {/* Phosphorus */}
            <SoilCard
              icon="atom"
              label="Phosphorus"
              value={`${zone.phosphorus} mg/kg`}
              status={
                zone.phosphorus < 20
                  ? "Low"
                  : "Normal"
              }
              statusColor={
                zone.phosphorus < 20
                  ? "#D63B40"
                  : "#16833F"
              }
            />

            {/* Potassium */}
            <SoilCard
              icon="circle-double"
              label="Potassium"
              value={`${zone.potassium} mg/kg`}
              status={
                zone.potassium < 50
                  ? "Low"
                  : "Normal"
              }
              statusColor={
                zone.potassium < 50
                  ? "#D63B40"
                  : "#16833F"
              }
            />

            {/* Slope */}
            <SoilCard
              icon="angle-acute"
              label="Slope"
              value={`${zone.slope} deg`}
              status={
                zone.slope >= 15
                  ? "High"
                  : zone.slope >= 8
                    ? "Medium"
                    : "Low"
              }
              statusColor={
                zone.slope >= 15
                  ? "#D63B40"
                  : zone.slope >= 8
                    ? "#D88925"
                    : "#16833F"
              }
            />
          </View>

          {/* Trees */}
          <Text style={styles.sectionTitle}>
            Trees in this Zone
          </Text>

          <View style={styles.treeContainer}>
            {zone.trees.map((tree, index) => (
              <Pressable
                key={tree.id}
                style={[
                  styles.treeRow,
                  index !== zone.trees.length - 1 &&
                    styles.treeBorder,
                ]}
                onPress={() => {
                  console.log("Tree pressed:", tree.id);

                  // Later:
                  // router.push({
                  //   pathname: "/fertilizer/tree/[treeId]",
                  //   params: { treeId: tree.id },
                  // });
                }}
              >
                <View style={styles.treeLeft}>
                  <Icon
                    name="palm-tree"
                    size={19}
                    color="#15823C"
                  />

                  <Text style={styles.treeName}>
                    {tree.id}
                  </Text>
                </View>

                <View style={styles.treeStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: getStatusColor(
                          tree.status,
                        ),
                      },
                    ]}
                  />

                  <Text style={styles.treeStatusText}>
                    {tree.status}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------
   Soil Card
--------------------------------------------------- */

type SoilCardProps = {
  icon: keyof typeof Icon.glyphMap;
  label: string;
  value: string;
  status: string;
  statusColor: string;
};

function SoilCard({
  icon,
  label,
  value,
  status,
  statusColor,
}: SoilCardProps) {
  return (
    <View style={styles.conditionCard}>
      <Icon
        name={icon}
        size={20}
        color="#16833F"
      />

      <Text style={styles.conditionLabel}>
        {label}
      </Text>

      <View style={styles.conditionValueRow}>
        <Text style={styles.conditionValue}>
          {value}
        </Text>

        <Text
          style={[
            styles.conditionStatus,
            {
              color: statusColor,
            },
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

/* ---------------------------------------------------
   Styles
--------------------------------------------------- */

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