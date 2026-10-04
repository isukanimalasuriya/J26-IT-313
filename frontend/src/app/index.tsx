import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Sample inputs matching your trained model's 19 features.
const sampleInput = {
  tree_age_years: 10,
  soil_ph: 5.5,
  nitrogen_mg_kg: 29.1,
  phosphorus_mg_kg: 32.5,
  potassium_mg_kg: 34.1,
  soil_moisture_pct: 23.6,
  salinity_ds_m: 1.11,
  organic_matter_pct: 1.77,
  slope_angle_deg: 0.4,
  mulch_present: 1,
  rainfall_previous_7d_mm: 31.5,
  rainfall_forecast_7d_mm: 59.2,
  days_since_last_fertilizer: 112,
  agro_climatic_zone: "dry",
  season: "first_half",
  soil_texture: "clay_loam",
  coconut_variety: "CRIC65",
  growth_stage: "bearing",
  rainfall_intensity: "moderate",
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function getPrediction() {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      if (!API_URL) {
        throw new Error("EXPO_PUBLIC_API_URL is missing. Check frontend/.env.");
      }

      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/api/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sampleInput),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);

        throw new Error(detail || `Server error: ${response.status}`);
      }

      if (typeof data.fertilizer_amount_kg_tree !== "number") {
        throw new Error("Unexpected prediction response.");
      }

      setResult(data.fertilizer_amount_kg_tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coconut Smart System</Text>

      <Text style={styles.description}>
        Test your trained model using a sample trees.
      </Text>

      <Pressable
        onPress={getPrediction}
        disabled={loading}
        style={[styles.button, loading && styles.disabled]}
      >
        <Text style={styles.buttonText}>
          {loading ? "Predicting..." : "Get Fertilizer Prediction"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/fertilizer")}
        style={[styles.button, { marginTop: 16 }]}
      >
        <Text style={styles.buttonText}>Open My Farm</Text>
      </Pressable>

      {result !== null && (
        <View style={styles.result}>
          <Text>Prototype fertilizer estimate</Text>
          <Text style={styles.amount}>{result.toFixed(3)} kg/tree</Text>
          <Text style={styles.note}>
            Synthetic-data estimate for testing only.
          </Text>
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F3F8F1",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#174D32",
    textAlign: "center",
  },
  description: {
    marginVertical: 20,
    textAlign: "center",
    color: "#526158",
  },
  button: {
    backgroundColor: "#237A48",
    padding: 16,
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  result: {
    marginTop: 24,
    alignItems: "center",
  },
  amount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#174D32",
    marginVertical: 10,
  },
  note: {
    color: "#526158",
    textAlign: "center",
  },
  error: {
    color: "#B42318",
    marginTop: 20,
    textAlign: "center",
  },
});
