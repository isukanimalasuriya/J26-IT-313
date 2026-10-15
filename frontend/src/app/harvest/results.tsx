import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Info,
  Leaf,
  Sprout,
} from "lucide-react-native";
import { useState } from "react";
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
    description: "Young coconuts",
    color: "#12A878",
  },
  {
    name: "Immature",
    description: "Still developing",
    color: "#F0A11A",
  },
  {
    name: "Matured",
    description: "Ready for the intended harvest",
    color: "#328044",
  },
  {
    name: "Dry",
    description: "Dry or over-mature",
    color: "#C43A3A",
  },
] as const;

function getSingleParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default function DetectionResultsScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    imageUri?: string | string[];
    treeId?: string | string[];
    fromDetection?: string | string[];
  }>();
  const imageUri = getSingleParam(params.imageUri);
  const requestedTreeId = getSingleParam(params.treeId);
  const fromDetection = getSingleParam(params.fromDetection) === "true";
  const treeId =
    requestedTreeId && /^[A-Za-z0-9_-]{1,24}$/.test(requestedTreeId)
      ? requestedTreeId
      : "C023";
  const [loadedImageUri, setLoadedImageUri] = useState<string>();
  const [failedImageUri, setFailedImageUri] = useState<string>();
  const imageError = Boolean(imageUri && failedImageUri === imageUri);
  const imageLoading = Boolean(imageUri && !imageError && loadedImageUri !== imageUri);
  const horizontalPadding = width < 360 ? 18 : 24;
  const imageHeight = Math.min(Math.max((width - horizontalPadding * 2) * 0.68, 210), 300);

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
                "Coconut detection and maturity classification are not connected yet. No detections or maturity predictions are shown on this screen.",
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
                accessibilityLabel="Selected coconut photo, not analyzed"
              />
              {imageLoading ? (
                <View style={styles.imageLoading}>
                  <ActivityIndicator color={COLORS.white} size="large" />
                  <Text style={styles.imageLoadingText}>Loading selected photo…</Text>
                </View>
              ) : null}
              <View style={styles.imageBadge}>
                <View style={styles.badgeDot} />
                <Text style={styles.imageBadgeText}>IMAGE PREVIEW · NOT ANALYZED</Text>
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
                  : "Choose a coconut photo to view it here. No analysis is available yet."}
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
            <Text style={styles.pendingPillText}>PENDING</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total coconuts detected</Text>
              <Text style={styles.totalNote}>AI detection is not connected</Text>
            </View>
            <Text style={styles.totalValue}>—</Text>
          </View>
          <View style={styles.divider} />
          {maturityStages.map((stage) => (
            <View key={stage.name} style={styles.summaryRow}>
              <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
              <Text style={styles.summaryStage}>{stage.name}</Text>
              <Text style={styles.summaryUnavailable}>Not available</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Coconut Maturity Stages</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Counts and percentages will appear when real model results are available.
        </Text>
        <View style={styles.stageList}>
          {maturityStages.map((stage) => (
            <View key={stage.name} style={styles.stageCard}>
              <View style={[styles.stageIcon, { backgroundColor: `${stage.color}18` }]}>
                <CircleHelp color={stage.color} size={19} />
              </View>
              <View style={styles.stageContent}>
                <View style={styles.stageTopRow}>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  <Text style={styles.stageCount}>—</Text>
                </View>
                <Text style={styles.stageDescription}>{stage.description}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { backgroundColor: stage.color, width: "0%" }]} />
                </View>
                <Text style={styles.percentageUnavailable}>Count and percentage unavailable</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Info color={COLORS.green} size={18} />
          <Text style={styles.noticeText}>
            No YOLOv8 detections or EfficientNetB0 maturity classifications are connected yet.
            Bounding boxes and sample predictions are intentionally omitted.
          </Text>
        </View>

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
          Harvest timing prediction is unavailable; the Random Forest model is not trained.
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
