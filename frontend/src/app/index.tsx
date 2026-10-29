import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coconut Smart System</Text>

      <Text style={styles.description}>
        Smart Coconut Plantation Management System
      </Text>

      <Pressable
        onPress={() => router.push("/fertilizer")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Open My Farm</Text>
      </Pressable>
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
    minWidth: 180,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
