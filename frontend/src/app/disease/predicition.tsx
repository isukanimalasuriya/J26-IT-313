import { useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, Camera, Leaf } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

type DiseaseResponse = {
  disease: string;
  confidence: number;
  severity?: {
    label: string;
  
  };
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://127.0.0.1:8000",
});

export default function PredictionScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<DiseaseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImagePick = async () => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setPrediction(null);
    setLoading(true);

    try {
      const formData = new FormData();
      const imagePart = Platform.OS === "web"
        ? await fetch(asset.uri).then((imageResponse) => imageResponse.blob())
        : ({
            uri: asset.uri,
            name: asset.fileName ?? "coconut-image.jpg",
            type: asset.mimeType ?? "image/jpeg",
          } as unknown as Blob);
      formData.append("file", imagePart);

      const response = await fetch(`${API_BASE_URL}/api/predict-disease`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail ?? "Unable to predict disease.");
      }

      setPrediction(payload as DiseaseResponse);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to predict disease.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable accessibilityLabel="Go back" hitSlop={8} onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.logo}>
            <Leaf size={23} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Prediction</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cameraCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.cameraIcon}>
              <Camera size={42} color="#168B46" />
            </View>
          )}
          <Text style={styles.title}>Disease prediction</Text>
          <Text style={styles.description}>Capture a coconut tree image to identify possible diseases.</Text>
          <Pressable style={styles.button} onPress={handleImagePick} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Camera size={19} color="#FFFFFF" />}
            <Text style={styles.buttonText}>
              {loading ? "Analyzing..." : imageUri ? "Choose another image" : "Select image"}
            </Text>
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {prediction && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEyebrow}>MODEL OUTPUT</Text>
            <Text style={styles.resultTitle}>{formatLabel(prediction.disease)}</Text>
            <Text style={styles.confidence}>{Math.round(prediction.confidence * 100)}% confidence</Text>
            {prediction.severity && (
              <View style={styles.severityBlock}>
                <Text style={styles.severityEyebrow}>SEVERITY</Text>
                <Text style={styles.severityTitle}>{prediction.severity.label}</Text>

              </View>
            )}
            <Text style={styles.disclaimer}>
              This result is an AI estimate and should be confirmed by an agricultural expert.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatLabel(label: string) {
  return label.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAF5" },
  header: { backgroundColor: "#168B46", paddingHorizontal: 18, paddingBottom: 20, paddingTop: 16 },
  headerRow: { alignItems: "center", flexDirection: "row" },
  backButton: { marginRight: 12 },
  logo: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 22,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginLeft: 12 },
  content: { flexGrow: 1, justifyContent: "center", padding: 18 },
  cameraCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E1D9",
    borderRadius: 28,
    borderWidth: 1,
    padding: 28,
  },
  cameraIcon: {
    alignItems: "center",
    backgroundColor: "#E4F4E9",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  preview: { borderRadius: 18, height: 220, width: "100%" },
  title: { color: "#183322", fontSize: 20, fontWeight: "700", marginTop: 20 },
  description: { color: "#637268", fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: "center" },
  button: {
    alignItems: "center",
    backgroundColor: "#168B46",
    borderRadius: 22,
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  error: { color: "#B42318", fontSize: 14, marginTop: 14, textAlign: "center" },
  resultCard: {
    backgroundColor: "#EAF6EE",
    borderColor: "#C6E4CF",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
    padding: 20,
  },
  resultEyebrow: { color: "#168B46", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  resultTitle: { color: "#183322", fontSize: 24, fontWeight: "700", marginTop: 8 },
  confidence: { color: "#168B46", fontSize: 15, fontWeight: "700", marginTop: 6 },
  severityBlock: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C6E4CF",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  severityEyebrow: { color: "#168B46", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  severityTitle: { color: "#183322", fontSize: 18, fontWeight: "700", marginTop: 5 },
  severityStage: { color: "#637268", fontSize: 13, marginTop: 4 },
  disclaimer: { color: "#637268", fontSize: 12, lineHeight: 18, marginTop: 16 },
});
