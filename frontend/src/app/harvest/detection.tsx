import { useEffect, useRef, useState } from "react";
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
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  Bell,
  Camera,
  Image as ImageIcon,
  Leaf,
  RotateCcw,
  UserRound,
  Zap,
  ZapOff,
} from "lucide-react-native";

const COLORS = {
  background: "#F7F9F8",
  green: "#08752E",
  darkGreen: "#075F25",
  text: "#17211B",
  muted: "#7A8590",
  white: "#FFFFFF",
};

type PickerAction = "gallery" | "capture" | null;

export default function CoconutDetectionScreen() {
  const { width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [pickerAction, setPickerAction] = useState<PickerAction>(null);
  const [error, setError] = useState("");
  const [resultNotice, setResultNotice] = useState("");
  const cameraRef = useRef<CameraView>(null);
  const permissionRequested = useRef(false);
  const actionInProgress = useRef(false);
  const horizontalPadding = width < 360 ? 18 : 24;
  const previewHeight = Math.max(300, Math.min((width - horizontalPadding * 2) * 1.12, 440));

  useEffect(() => {
    if (permissionRequested.current) return;
    permissionRequested.current = true;
    requestPermission().catch((reason: unknown) => {
      setCameraError(
        reason instanceof Error
          ? reason.message
          : "Camera permission could not be requested.",
      );
    });
  }, [requestPermission]);

  async function chooseFromGallery() {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setPickerAction("gallery");
    setError("");

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0]?.uri;
        if (!selectedImage) {
          throw new Error("The selected photo could not be opened. Please try another image.");
        }
        setImageUri(selectedImage);
        setCameraReady(false);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The photo library could not be opened. Please try again.",
      );
    } finally {
      actionInProgress.current = false;
      setPickerAction(null);
    }
  }

  async function capturePhoto() {
    if (actionInProgress.current) return;
    if (imageUri) {
      setImageUri(null);
      setError("");
      setCameraReady(false);
      return;
    }

    if (!permission?.granted) {
      if (permission?.canAskAgain === false) {
        setError("Camera access is off. Choose a photo from your gallery instead.");
        return;
      }

      try {
        const result = await requestPermission();
        if (!result.granted) {
          setError("Camera access was denied. You can still choose a photo from your gallery.");
        }
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Camera permission could not be requested.",
        );
      }
      return;
    }

    if (!cameraReady || !cameraRef.current) {
      setError("Camera is starting. Please wait a moment and try again.");
      return;
    }

    actionInProgress.current = true;
    setPickerAction("capture");
    setError("");
    try {
      const captured = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (!captured.uri) {
        throw new Error("The camera did not return a photo. Please try again.");
      }
      setImageUri(captured.uri);
      setCameraReady(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The photo could not be captured. Please try again.",
      );
    } finally {
      actionInProgress.current = false;
      setPickerAction(null);
    }
  }

  function continueToResult() {
    if (!imageUri || actionInProgress.current) return;
    setResultNotice(
      "The Detection Result page is not available yet. This photo has not been analyzed.",
    );
    Alert.alert(
      "Detection Result",
      "Your image is ready, but the Detection Result page and coconut AI inference are not implemented yet. This photo has not been analyzed.",
    );
  }

  const cameraAvailable = Boolean(permission?.granted) && !cameraError;
  const busy = pickerAction !== null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Leaf color={COLORS.green} size={20} fill={COLORS.green} />
            </View>
            <Text style={styles.brandName}>CocoSmart AI</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() =>
                Alert.alert("Notifications", "There are no new notifications.")
              }
              style={styles.iconButton}
            >
              <Bell color="#7D8993" size={21} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              onPress={() => Alert.alert("Profile", "Profile settings are not available yet.")}
              style={styles.profileButton}
            >
              <UserRound color={COLORS.green} size={21} />
            </Pressable>
          </View>
        </View>

        <View style={styles.treeRow}>
          <Text style={styles.treeLabel}>TREE C023</Text>
          <Text style={styles.previewTag}>PREVIEW ONLY</Text>
        </View>

        <View
          style={[styles.previewFrame, { height: previewHeight }]}
          accessibilityLabel={
            imageUri
              ? "Selected coconut image preview"
              : cameraAvailable
                ? "Live camera preview for coconut detection"
                : "Camera preview unavailable"
          }
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              accessibilityLabel="Selected coconut bunch photo"
            />
          ) : cameraAvailable ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={flashEnabled}
              onCameraReady={() => setCameraReady(true)}
              onMountError={(event) => {
                setCameraError(event.message);
                setError(`Camera preview could not start: ${event.message}`);
              }}
            />
          ) : (
            <View style={styles.emptyPreview}>
              {permission === null ? (
                <ActivityIndicator color={COLORS.green} size="large" />
              ) : (
                <Camera color="#779080" size={44} strokeWidth={1.6} />
              )}
              <Text style={styles.emptyTitle}>
                {permission === null ? "Preparing camera..." : "Camera unavailable"}
              </Text>
              <Text style={styles.emptyDescription}>
                Choose a coconut photo from your gallery to preview it here.
              </Text>
            </View>
          )}

          <View pointerEvents="none" style={styles.frameCorners}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.cameraBadge}>
            <View
              style={[
                styles.statusDot,
                (imageUri || cameraReady) && styles.statusDotActive,
              ]}
            />
            <Text style={styles.cameraBadgeText}>
              {imageUri
                ? "IMAGE READY · PREVIEW ONLY"
                : cameraAvailable
                  ? cameraReady
                    ? "CAMERA READY"
                    : "OPENING CAMERA"
                  : "CAMERA OFF"}
            </Text>
          </View>
        </View>

        <View style={styles.instruction}>
          <Text style={styles.instructionTitle}>
            Capture clear image of coconut bunch
          </Text>
          <Text style={styles.instructionDescription}>
            Ensure coconuts are visible under natural light
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose a coconut photo from your gallery"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={chooseFromGallery}
            style={({ pressed }) => [
              styles.sideControl,
              busy && styles.disabledControl,
              pressed && !busy && styles.pressedControl,
            ]}
          >
            <View style={styles.sideControlIcon}>
              {pickerAction === "gallery" ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <ImageIcon color={COLORS.text} size={24} />
              )}
            </View>
            <Text style={styles.controlLabel}>Gallery</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={imageUri ? "Retake photo" : "Capture coconut photo"}
            accessibilityState={{
              disabled: busy || (!imageUri && (!cameraAvailable || !cameraReady)),
            }}
            disabled={busy || (!imageUri && (!cameraAvailable || !cameraReady))}
            onPress={capturePhoto}
            style={({ pressed }) => [
              styles.captureButton,
              (busy || (!imageUri && (!cameraAvailable || !cameraReady))) &&
                styles.captureButtonDisabled,
              pressed && !busy && styles.captureButtonPressed,
            ]}
          >
            {pickerAction === "capture" ? (
              <ActivityIndicator color={COLORS.white} size="large" />
            ) : imageUri ? (
              <RotateCcw color={COLORS.white} size={28} />
            ) : (
              <Camera color={COLORS.white} size={30} />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={flashEnabled ? "Turn flash off" : "Turn flash on"}
            accessibilityState={{
              checked: flashEnabled,
              disabled: !cameraAvailable || Boolean(imageUri) || busy,
            }}
            disabled={!cameraAvailable || Boolean(imageUri) || busy}
            onPress={() => setFlashEnabled((enabled) => !enabled)}
            style={({ pressed }) => [
              styles.sideControl,
              (!cameraAvailable || imageUri || busy) && styles.disabledControl,
              pressed && cameraAvailable && !imageUri && !busy && styles.pressedControl,
            ]}
          >
            <View style={[styles.sideControlIcon, flashEnabled && styles.flashOnIcon]}>
              {flashEnabled ? (
                <Zap color={COLORS.green} size={24} />
              ) : (
                <ZapOff color={COLORS.text} size={24} />
              )}
            </View>
            <Text style={styles.controlLabel}>Flash</Text>
          </Pressable>
        </View>

        {error ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to Detection Result"
          accessibilityState={{ disabled: !imageUri || busy }}
          disabled={!imageUri || busy}
          onPress={continueToResult}
          style={({ pressed }) => [
            styles.continueButton,
            (!imageUri || busy) && styles.continueButtonDisabled,
            pressed && imageUri && !busy && styles.continueButtonPressed,
          ]}
        >
          <Text style={styles.continueText}>Continue to Detection Result</Text>
        </Pressable>

        {resultNotice ? (
          <Text accessibilityRole="alert" style={styles.resultNotice}>
            {resultNotice}
          </Text>
        ) : null}

        <Text style={styles.disclaimer}>
          Photo selection and capture only. No coconut AI analysis is connected.
        </Text>
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
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 22,
  },
  header: {
    minHeight: 52,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  iconButton: {
    width: 30,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EA4B4B",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#20B65A",
    backgroundColor: "#E8F7EC",
    alignItems: "center",
    justifyContent: "center",
  },
  treeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 10,
  },
  treeLabel: {
    color: "#33453A",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  previewTag: {
    color: COLORS.green,
    backgroundColor: "#E7F5EB",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  previewFrame: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    borderRadius: 24,
    backgroundColor: "#E8EEE9",
  },
  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDescription: {
    maxWidth: 250,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  frameCorners: {
    ...StyleSheet.absoluteFill,
    margin: 22,
  },
  corner: {
    position: "absolute",
    width: 31,
    height: 31,
    borderColor: COLORS.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    right: 0,
    bottom: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cameraBadge: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    transform: [{ translateY: -15 }],
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(6, 96, 38, 0.9)",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C7D5CA",
  },
  statusDotActive: {
    backgroundColor: "#8CF1A4",
  },
  cameraBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.35,
  },
  instruction: {
    alignItems: "center",
    marginTop: 22,
  },
  instructionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  instructionDescription: {
    marginTop: 4,
    color: "#88938C",
    fontSize: 12,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 25,
    marginBottom: 20,
  },
  sideControl: {
    width: 72,
    alignItems: "center",
  },
  sideControlIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3E8E1",
    alignItems: "center",
    justifyContent: "center",
  },
  flashOnIcon: {
    backgroundColor: "#DDF3E3",
  },
  controlLabel: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  captureButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    borderColor: "#D5EAD9",
    backgroundColor: "#086B2A",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonDisabled: {
    opacity: 0.62,
  },
  captureButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  disabledControl: {
    opacity: 0.5,
  },
  pressedControl: {
    opacity: 0.75,
  },
  errorText: {
    marginBottom: 12,
    color: "#B42318",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  continueButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: COLORS.darkGreen,
    paddingHorizontal: 18,
  },
  continueButtonDisabled: {
    backgroundColor: "#AAB9AE",
  },
  continueButtonPressed: {
    opacity: 0.86,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  resultNotice: {
    marginTop: 10,
    color: "#8A5A00",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  disclaimer: {
    marginTop: 10,
    color: "#7E8982",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },
});
