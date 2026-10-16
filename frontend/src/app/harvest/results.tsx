import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Info,
  Leaf,
  Sprout,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#F7F9F8",
  green: "#08752E",
  darkGreen: "#075F25",
  text: "#17211B",
  muted: "#748078",
  border: "#E4ECE6",
  white: "#FFFFFF",
};

const maturityStages = [
  {
    name: "Tender",
    modelClass: "tender",
    description: "Young coconuts",
    color: "#12A878",
  },
  {
    name: "Immature",
    modelClass: "immature",
    description: "Still developing",
    color: "#F0A11A",
  },
  {
    name: "Matured",
    modelClass: "matured",
    description: "Ready for the intended harvest",
    color: "#328044",
  },
  {
    name: "Dry",
    modelClass: "dry",
    description: "Dry or over-mature",
    color: "#C43A3A",
  },
] as const;

const MATURITY_CLASSES = ["dry", "immature", "matured", "tender"] as const;
const MATURITY_LABELS: Record<(typeof MATURITY_CLASSES)[number], string> = {
  dry: "Dry",
  immature: "Immature",
  matured: "Matured",
  tender: "Tender",
} as const;

type MaturityClass = (typeof MATURITY_CLASSES)[number];
type CoconutDetection = {
  coconut_index: number;
  bounding_box: { x1: number; y1: number; x2: number; y2: number };
  maturity: MaturityClass;
  maturity_confidence: number;
  detection_confidence: number;
};
type CoconutAnalysis = {
  success: true;
  image_dimensions: { width: number; height: number };
  detected_coconut_count: number;
  maturity_counts: Record<MaturityClass, number>;
  detections: CoconutDetection[];
};
type ReactNativeImageFile = {
  uri: string;
  name: string;
  type: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

function getNormalizedApiBaseUrl(urlValue: string | undefined) {
  if (!urlValue) return "";

  const trimmed = urlValue.trim();
  if (!trimmed) return "";

  return `${trimmed.replace(/\/+$/, "").replace(/\/api$/i, "")}/api`;
}

const API_BASE_URL = getNormalizedApiBaseUrl(API_URL);

function getAnalyzeRequestUrl() {
  if (!API_BASE_URL) return "";
  return `${API_BASE_URL}/coconut/analyze`;
}

function isLocalhostUrl(urlValue: string | undefined) {
  if (!urlValue) return false;

  try {
    const resolved = new URL(urlValue);
    const hostname = resolved.hostname.toLowerCase();
    return [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
      "10.0.2.2",
    ].includes(hostname);
  } catch {
    return false;
  }
}

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMaturityClass(value: unknown): value is MaturityClass {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(MATURITY_LABELS, value)
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isConfidence(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function parseAnalysis(value: unknown): CoconutAnalysis | null {
  if (!isRecord(value) || value.success !== true) return null;

  const dimensions = value.image_dimensions;
  const rawCounts = value.maturity_counts;
  const width = isRecord(dimensions) ? dimensions.width : undefined;
  const height = isRecord(dimensions) ? dimensions.height : undefined;
  const detectedCount = value.detected_coconut_count;
  if (
    !isRecord(dimensions) ||
    !isPositiveInteger(width) ||
    !isPositiveInteger(height) ||
    !isRecord(rawCounts) ||
    !Array.isArray(value.detections) ||
    !isNonNegativeInteger(detectedCount)
  ) {
    return null;
  }

  const maturityCounts: Record<MaturityClass, number> = {
    dry: 0,
    immature: 0,
    matured: 0,
    tender: 0,
  };
  for (const maturity of MATURITY_CLASSES) {
    const count = rawCounts[maturity];
    if (!isNonNegativeInteger(count)) return null;
    maturityCounts[maturity] = count;
  }

  const detections: CoconutDetection[] = [];
  for (const rawDetection of value.detections) {
    if (!isRecord(rawDetection) || !isRecord(rawDetection.bounding_box)) return null;

    const box = rawDetection.bounding_box;
    const { x1, y1, x2, y2 } = box;
    const coconutIndex = rawDetection.coconut_index;
    const detectionConfidence = rawDetection.detection_confidence;
    const maturityConfidence = rawDetection.maturity_confidence;
    const maturity = rawDetection.maturity;
    if (
      !isPositiveInteger(coconutIndex) ||
      !isMaturityClass(maturity) ||
      !isConfidence(detectionConfidence) ||
      !isConfidence(maturityConfidence) ||
      !isNonNegativeInteger(x1) ||
      !isNonNegativeInteger(y1) ||
      !isPositiveInteger(x2) ||
      !isPositiveInteger(y2) ||
      x2 > width ||
      y2 > height ||
      x2 <= x1 ||
      y2 <= y1
    ) {
      return null;
    }

    detections.push({
      coconut_index: coconutIndex,
      bounding_box: { x1, y1, x2, y2 },
      maturity,
      maturity_confidence: maturityConfidence,
      detection_confidence: detectionConfidence,
    });
  }

  if (detections.length !== detectedCount) return null;

  const actualCounts: Record<MaturityClass, number> = {
    dry: 0,
    immature: 0,
    matured: 0,
    tender: 0,
  };
  for (const detection of detections) {
    actualCounts[detection.maturity] += 1;
  }
  if (
    MATURITY_CLASSES.some(
      (maturity) => actualCounts[maturity] !== maturityCounts[maturity],
    )
  ) {
    return null;
  }

  return {
    success: true,
    image_dimensions: {
      width,
      height,
    },
    detected_coconut_count: detectedCount,
    maturity_counts: maturityCounts,
    detections,
  };
}

function getImageUploadDetails(
  imageUri: string,
  requestedName: string | undefined,
  requestedType: string | undefined,
) {
  const uriName = imageUri.split(/[\\/]/).pop()?.split(/[?#]/)[0];
  const name = requestedName || uriName || "coconut-image.jpg";
  const extension = name.split(".").pop()?.toLowerCase();
  const type =
    requestedType ||
    (extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg");
  return { name, type };
}

export default function DetectionResultsScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    imageUri?: string | string[];
    imageName?: string | string[];
    imageType?: string | string[];
    treeId?: string | string[];
    fromDetection?: string | string[];
  }>();
  const imageUri = getSingleParam(params.imageUri);
  const imageName = getSingleParam(params.imageName);
  const imageType = getSingleParam(params.imageType);
  const requestedTreeId = getSingleParam(params.treeId);
  const fromDetection = getSingleParam(params.fromDetection) === "true";
  const treeId =
    requestedTreeId && /^[A-Za-z0-9_-]{1,24}$/.test(requestedTreeId)
      ? requestedTreeId
      : "C023";
  const [loadedImageUri, setLoadedImageUri] = useState<string>();
  const [failedImageUri, setFailedImageUri] = useState<string>();
  const [analysis, setAnalysis] = useState<CoconutAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(Boolean(imageUri));
  const [analysisError, setAnalysisError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const imageError = Boolean(imageUri && failedImageUri === imageUri);
  const imageLoading = Boolean(imageUri && !imageError && loadedImageUri !== imageUri);
  const hasSelectedImage = Boolean(imageUri);
  const analysisStatusLabel = analysisLoading
    ? "ANALYZING IMAGE"
    : analysis
      ? "AI ANALYSIS COMPLETE"
      : analysisError
        ? "ANALYSIS FAILED"
        : hasSelectedImage
          ? "WAITING FOR ANALYSIS"
          : "SELECT AN IMAGE";
  const summaryStatusLabel = analysisLoading
    ? "ANALYZING"
    : analysis
      ? "COMPLETE"
      : analysisError
        ? "FAILED"
        : hasSelectedImage
          ? "WAITING"
          : "PENDING";
  const horizontalPadding = width < 360 ? 18 : 24;
  const imageHeight = Math.min(Math.max((width - horizontalPadding * 2) * 0.68, 210), 300);

  useEffect(() => {
    let active = true;

    async function analyzeSelectedImage() {
      setAnalysis(null);
      setAnalysisError("");

      if (!imageUri) {
        setAnalysisLoading(false);
        setAnalysisError("No image was provided. Return and select or capture a photo first.");
        return;
      }

      if (!API_BASE_URL) {
        setAnalysisLoading(false);
        setAnalysisError("The analysis server URL is not configured in frontend/.env.");
        return;
      }

      const requestUrl = getAnalyzeRequestUrl();
      if (isLocalhostUrl(API_URL)) {
        setAnalysisLoading(false);
        setAnalysisError(
          "Expo Go cannot reach localhost. Set EXPO_PUBLIC_API_URL to your computer's LAN IP, such as http://192.168.1.50:5000.",
        );
        return;
      }

      setAnalysisLoading(true);
      try {
        const form = new FormData();
        const uploadDetails = getImageUploadDetails(imageUri, imageName, imageType);
        const nativeForm = form as unknown as {
          append(name: string, value: ReactNativeImageFile): void;
        };
        nativeForm.append("image", {
          uri: imageUri,
          name: uploadDetails.name,
          type: uploadDetails.type,
        });

        let response: Response;
        try {
          if (__DEV__) {
            console.log("[Coconut AI] POST", requestUrl);
          }

          response = await fetch(requestUrl, {
            method: "POST",
            body: form,
          });
        } catch (error) {
          if (__DEV__) {
            console.warn("[Coconut AI] fetch network error:", error instanceof Error ? error.message : error);
          }
          throw new Error(
            "Could not connect to the analysis server. Check that your phone and backend are reachable on the same network.",
          );
        }

        const responseText = await response.text();
        if (__DEV__) {
          console.log("[Coconut AI] HTTP status:", response.status, "body:", responseText.slice(0, 240));
        }

        let responseBody: unknown;
        try {
          responseBody = JSON.parse(responseText);
        } catch {
          if (!response.ok) {
            throw new Error(`The analysis server returned an error (HTTP ${response.status}).`);
          }
          throw new Error("The analysis server returned an unreadable response.");
        }

        if (!response.ok) {
          const serverMessage =
            isRecord(responseBody) && typeof responseBody.error === "string"
              ? responseBody.error
              : "";

          if (serverMessage) {
            if (__DEV__) {
              console.warn("[Coconut AI] server error:", response.status, serverMessage);
            }
            throw new Error(serverMessage);
          }

          if (response.status >= 500) {
            throw new Error(
              "The AI analysis service could not process this image. Please try again later.",
            );
          }

          throw new Error(
            `The analysis request failed (HTTP ${response.status}).`,
          );
        }

        const parsedAnalysis = parseAnalysis(responseBody);
        if (!parsedAnalysis) {
          throw new Error("The analysis server returned an invalid prediction response.");
        }

        if (active) setAnalysis(parsedAnalysis);
      } catch (reason) {
        if (active) {
          const message =
            reason instanceof Error
              ? reason.message
              : "Coconut analysis failed. Please try again.";

          setAnalysisError(message);

          if (__DEV__) {
            console.warn("Coconut analysis failed:", message);
          }
        }
      } finally {
        if (active) setAnalysisLoading(false);
      }
    }

    void analyzeSelectedImage();
    return () => {
      active = false;
    };
  }, [imageUri, imageName, imageType, retryCount]);

  function returnToDetection() {
    if (fromDetection && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/harvest/detection");
    }
  }

  function openPredictionDetails() {
    router.push({
      pathname: "/harvest/prediction",
      params: { treeId, fromResults: "true" },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandHeader}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Leaf color={COLORS.green} size={19} fill={COLORS.green} />
            </View>
            <Text style={styles.brandName}>CocoSmart AI</Text>
          </View>
          <View style={styles.treePill}>
            <Text style={styles.treePillText}>TREE {treeId}</Text>
          </View>
        </View>

        <View style={styles.titleHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back to Coconut Detection"
            onPress={returnToDetection}
            style={styles.iconButton}
          >
            <ArrowLeft color={COLORS.text} size={23} />
          </Pressable>
          <Text style={styles.title}>Detection Result</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="About these detection results"
            onPress={() =>
              Alert.alert(
                "About these results",
                "Coconut detection and maturity classifications are returned by the connected AI inference service.",
              )
            }
            style={styles.iconButton}
          >
            <Info color={COLORS.text} size={22} />
          </Pressable>
        </View>

        <View
          style={[styles.imageFrame, { height: imageHeight }]}
          accessibilityLabel={imageUri ? "Selected coconut image" : "No image selected"}
        >
          {imageUri && !imageError ? (
            <>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
                onLoadEnd={() => setLoadedImageUri(imageUri)}
                onError={() => {
                  setFailedImageUri(imageUri);
                }}
                accessibilityLabel="Selected coconut photo"
              />
              {imageLoading ? (
                <View style={styles.imageLoading}>
                  <ActivityIndicator color={COLORS.white} size="large" />
                  <Text style={styles.imageLoadingText}>Loading selected photo…</Text>
                </View>
              ) : null}
              <View style={styles.imageBadge}>
                <View style={styles.badgeDot} />
                <Text style={styles.imageBadgeText}>{analysisStatusLabel}</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyImage}>
              <Sprout color="#6F9179" size={38} />
              <Text style={styles.emptyImageTitle}>
                {imageError ? "Photo could not be loaded" : "No image selected"}
              </Text>
              <Text style={styles.emptyImageText}>
                {imageError
                  ? "Return to Coconut Detection and choose the photo again."
                  : "Select a coconut image to begin analysis."}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select another image"
                onPress={returnToDetection}
                style={styles.emptyImageAction}
              >
                <Text style={styles.emptyImageActionText}>Select an image</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Detection Summary</Text>
          <View style={styles.pendingPill}>
            <Text style={styles.pendingPillText}>{summaryStatusLabel}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total coconuts detected</Text>
              <Text style={styles.totalNote}>
                {analysis
                  ? `${analysis.image_dimensions.width} × ${analysis.image_dimensions.height} image`
                  : analysisLoading
                    ? "Running coconut detection and maturity classification"
                    : "Results appear after successful AI analysis"}
              </Text>
            </View>
            {analysisLoading ? (
              <ActivityIndicator color={COLORS.green} />
            ) : (
              <Text style={styles.totalValue}>
                {analysis ? analysis.detected_coconut_count : "—"}
              </Text>
            )}
          </View>
          <View style={styles.divider} />
          {maturityStages.map((stage) => (
            <View key={stage.name} style={styles.summaryRow}>
              <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
              <Text style={styles.summaryStage}>{stage.name}</Text>
              <Text style={styles.summaryUnavailable}>
                {analysis
                  ? analysis.maturity_counts[stage.modelClass]
                  : "—"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Coconut Maturity Stages</Text>
        </View>
        <Text style={styles.sectionDescription}>
          {analysis
            ? "Counts by maturity class from the coconut AI analysis."
            : "Counts and percentages will appear when model results are available."}
        </Text>
        <View style={styles.stageList}>
          {maturityStages.map((stage) => {
            const count = analysis?.maturity_counts[stage.modelClass];
            const percentage =
              count !== undefined && analysis && analysis.detected_coconut_count > 0
                ? Math.round((count / analysis.detected_coconut_count) * 100)
                : 0;
            return (
              <View key={stage.name} style={styles.stageCard}>
                <View style={[styles.stageIcon, { backgroundColor: `${stage.color}18` }]}>
                  <CircleHelp color={stage.color} size={19} />
                </View>
                <View style={styles.stageContent}>
                  <View style={styles.stageTopRow}>
                    <Text style={styles.stageName}>{stage.name}</Text>
                    <Text style={styles.stageCount}>{count ?? "—"}</Text>
                  </View>
                  <Text style={styles.stageDescription}>{stage.description}</Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: stage.color,
                          width: `${percentage}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageUnavailable}>
                    {count === undefined
                      ? "Count and percentage unavailable"
                      : `${percentage}% of detected coconuts`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Individual Detections</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Each detected coconut includes its bounding box and model confidence scores.
        </Text>
        <View style={styles.stageList}>
          {analysis?.detections.map((detection) => (
            <View key={detection.coconut_index} style={styles.stageCard}>
              <View style={styles.stageIcon}>
                <CircleHelp color={COLORS.green} size={19} />
              </View>
              <View style={styles.stageContent}>
                <View style={styles.stageTopRow}>
                  <Text style={styles.stageName}>
                    Coconut {detection.coconut_index} · {MATURITY_LABELS[detection.maturity]}
                  </Text>
                  <Text style={styles.stageCount}>
                    {Math.round(detection.maturity_confidence * 100)}%
                  </Text>
                </View>
                <Text style={styles.stageDescription}>
                  Box: ({detection.bounding_box.x1}, {detection.bounding_box.y1}) – ({detection.bounding_box.x2}, {detection.bounding_box.y2})
                </Text>
                <Text style={styles.stageDescription}>
                  Detection confidence: {Math.round(detection.detection_confidence * 100)}% · Maturity confidence: {Math.round(detection.maturity_confidence * 100)}%
                </Text>
              </View>
            </View>
          ))}
          {analysis && analysis.detections.length === 0 ? (
            <Text style={styles.sectionDescription}>No coconuts were detected in this image.</Text>
          ) : null}
        </View>

        {analysisLoading ? (
          <View style={styles.notice}>
            <ActivityIndicator color={COLORS.green} />
            <Text style={styles.noticeText}>Analyzing the selected image. This may take a moment.</Text>
          </View>
        ) : null}
        {analysisError ? (
          <View style={styles.notice} accessibilityRole="alert">
          <Info color={COLORS.green} size={18} />
          <Text style={styles.noticeText}>
            {analysisError}
          </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry coconut image analysis"
              disabled={analysisLoading || !imageUri}
              onPress={() => setRetryCount((count) => count + 1)}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View details and prediction status"
          onPress={openPredictionDetails}
          style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
        >
          <Text style={styles.detailsButtonText}>View Details &amp; Prediction</Text>
          <ArrowRight color={COLORS.white} size={20} />
        </Pressable>
        <Text style={styles.predictionNote}>
          Harvest timing prediction is separate and is not provided by coconut image analysis.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select another image"
          onPress={returnToDetection}
          style={({ pressed }) => [styles.selectAnotherButton, pressed && styles.pressed]}
        >
          <Text style={styles.selectAnotherText}>Select Another Image</Text>
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
    paddingTop: 6,
    paddingBottom: 30,
  },
  brandHeader: {
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
  treePill: {
    borderRadius: 10,
    backgroundColor: "#E7F5EB",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  treePillText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  titleHeader: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  imageFrame: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    borderRadius: 22,
    backgroundColor: "#E8EEE9",
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  imageLoading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(20, 38, 26, 0.38)",
  },
  imageLoadingText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
  imageBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(20, 42, 27, 0.84)",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F5C451",
  },
  imageBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  emptyImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyImageTitle: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyImageText: {
    maxWidth: 280,
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  emptyImageAction: {
    minHeight: 42,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 14,
  },
  emptyImageActionText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.25,
  },
  pendingPill: {
    borderRadius: 12,
    backgroundColor: "#E8F3E8",
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pendingPillText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.45,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 15,
    shadowColor: "#163520",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 13,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  totalNote: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
  },
  totalValue: {
    color: COLORS.darkGreen,
    fontSize: 24,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 3,
  },
  summaryRow: {
    minHeight: 37,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  stageDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  summaryStage: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryUnavailable: {
    color: COLORS.muted,
    fontSize: 12,
  },
  sectionDescription: {
    marginTop: -3,
    marginBottom: 12,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  stageList: {
    gap: 9,
  },
  stageCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: 13,
  },
  stageIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stageContent: {
    flex: 1,
  },
  stageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stageName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  stageCount: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  stageDescription: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
  },
  progressTrack: {
    height: 5,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#EDF1EE",
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentageUnavailable: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 10,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderRadius: 14,
    backgroundColor: "#EAF4EC",
    padding: 13,
    marginTop: 15,
  },
  noticeText: {
    flex: 1,
    color: "#42584A",
    fontSize: 11,
    lineHeight: 17,
  },
  retryButton: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  retryButtonText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "700",
  },
  detailsButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 28,
    backgroundColor: "#086B2A",
    marginTop: 18,
    paddingHorizontal: 18,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  predictionNote: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  selectAnotherButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  selectAnotherText: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.78,
  },
});
