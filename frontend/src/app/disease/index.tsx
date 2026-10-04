import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function DiseaseScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Disease Detection</Text>

        <Text style={styles.description}>
          Scan coconut leaves and detect diseases using AI.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF7",
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#153D20",
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B6B6B",
  },
});
