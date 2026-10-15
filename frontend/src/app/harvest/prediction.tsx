import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CalendarClock, Info, Leaf } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getTreeId(value: string | string[] | undefined) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,24}$/.test(value)) {
    return "C023";
  }
  return value;
}

export default function PredictionPlaceholderScreen() {
  const params = useLocalSearchParams<{
    treeId?: string | string[];
    fromResults?: string | string[];
  }>();
  const treeId = getTreeId(params.treeId);
  const fromResults = params.fromResults === "true";

  function returnToResults() {
    if (fromResults && router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/harvest/results", params: { treeId } });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to detection results"
            onPress={returnToResults}
            style={styles.backButton}
          >
            <ArrowLeft color="#17211B" size={22} />
          </Pressable>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Leaf color="#08752E" size={19} fill="#08752E" />
            </View>
            <Text style={styles.brandName}>CocoSmart AI</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.eyebrow}>TREE {treeId}</Text>
        <Text style={styles.title}>Details &amp; Prediction</Text>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <CalendarClock color="#08752E" size={26} />
          </View>
          <Text style={styles.cardTitle}>Harvest prediction is not available yet</Text>
          <Text style={styles.description}>
            The Random Forest model for estimating weeks remaining until maturity has not been
            trained or connected. No harvest date or prediction is being shown.
          </Text>
          <View style={styles.notice}>
            <Info color="#08752E" size={18} />
            <Text style={styles.noticeText}>
              This screen is a placeholder. Detection and maturity results are also pending model
              integration.
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to detection results"
          onPress={returnToResults}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Back to Detection Results</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
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
  eyebrow: {
    marginTop: 28,
    color: "#08752E",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    color: "#17211B",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  card: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4ECE6",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginTop: 22,
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#EAF4EC",
  },
  cardTitle: {
    marginTop: 16,
    color: "#17211B",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    marginTop: 9,
    color: "#748078",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderRadius: 13,
    backgroundColor: "#EAF4EC",
    padding: 13,
    marginTop: 18,
  },
  noticeText: {
    flex: 1,
    color: "#42584A",
    fontSize: 11,
    lineHeight: 17,
  },
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#086B2A",
    marginTop: 22,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
});
